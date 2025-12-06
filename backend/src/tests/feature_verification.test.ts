import { expect } from 'chai';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User from '../models/User';
import Workspace from '../models/Workspace';
import File from '../models/File';
import { inviteUser } from '../controllers/workspaceController';
import { createFile, updateFile } from '../controllers/fileController';
import sinon from 'sinon';
import * as emailService from '../services/emailService';

// Mock Express Request and Response
const mockRequest = (body: any = {}, params: any = {}, user: any = {}) => ({
    body,
    params,
    user,
} as any);

const mockResponse = () => {
    const res: any = {};
    res.status = sinon.stub().returns(res);
    res.json = sinon.stub().returns(res);
    return res;
};

describe('Feature Verification Tests', function () {
    this.timeout(10000); // Increase timeout for MongoDB Memory Server

    let mongoServer: MongoMemoryServer;
    let userId: any;
    let workspaceId: any;
    let fileId: any;

    before(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);
    });

    after(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    beforeEach(async () => {
        // Clear database
        await User.deleteMany({});
        await Workspace.deleteMany({});
        await File.deleteMany({});

        // Create a user
        const user = await User.create({
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123'
        });
        userId = user._id;

        // Create a workspace
        const workspace = await Workspace.create({
            name: 'Test Workspace',
            ownerId: userId,
            createdBy: userId,
            members: [userId],
            activityLog: []
        });
        workspaceId = workspace._id;
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('Invite User Feature', () => {
        it('should invite a user and attempt to send an email', async () => {
            // Create another user to invite
            await User.create({
                username: 'inviteduser',
                email: 'invited@example.com',
                password: 'password123'
            });

            const req = mockRequest(
                { email: 'invited@example.com' },
                { id: workspaceId },
                { username: 'testuser' }
            );
            const res = mockResponse();

            // Stub email service
            const sendEmailStub = sinon.stub(emailService, 'sendInvitationEmail').resolves(true);

            await inviteUser(req, res);

            expect(res.json.called).to.be.true;
            const updatedWorkspace = res.json.firstCall.args[0];

            // Allow for updatedWorkspace to be a Mongoose document or plain object
            const members = updatedWorkspace.members.map((m: any) => m.toString());
            expect(members).to.have.lengthOf(2);

            // Verify activity log
            const logEntry = updatedWorkspace.activityLog.find((log: any) => log.action === 'Invited User');
            expect(logEntry).to.exist;
            expect(logEntry.user).to.equal('testuser');
            expect(logEntry.file).to.equal('inviteduser');

            // Verify email was sent
            expect(sendEmailStub.calledOnce).to.be.true;
            expect(sendEmailStub.firstCall.args[0]).to.equal('invited@example.com');
        });
    });

    describe('Activity Log & File Optimization Features', () => {
        it('should log activity on file creation with correct username', async () => {
            const req = mockRequest(
                { name: 'test.ts', language: 'typescript', content: 'console.log("hi")' },
                { workspaceId: workspaceId },
                { username: 'creatorUser' } // Simulate logged in user
            );
            const res = mockResponse();

            await createFile(req, res);

            const workspace = await Workspace.findById(workspaceId);
            const logEntry = workspace?.activityLog.find(log => log.action === 'Created File');

            expect(logEntry).to.exist;
            expect(logEntry?.user).to.equal('creatorUser');
            expect(logEntry?.file).to.equal('test.ts');
        });

        it('should NOT log activity on file update (optimization check)', async () => {
            // First create a file
            const file = await File.create({
                workspaceId,
                name: 'update_test.ts',
                language: 'typescript',
                content: 'original'
            });
            fileId = file._id;

            const req = mockRequest(
                { content: 'updated content' },
                { id: fileId },
                { username: 'updaterUser' }
            );
            const res = mockResponse();

            await updateFile(req, res);

            const workspace = await Workspace.findById(workspaceId);
            // We expect NO "Updated File" action in the logs for this file
            const updateLogs = workspace?.activityLog.filter(log => log.action === 'Updated File' && log.file === 'update_test.ts');

            expect(updateLogs).to.have.lengthOf(0);
        });
    });
});
