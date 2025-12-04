import { io } from 'socket.io-client';
import { expect } from 'chai';

const SOCKET_URL = 'http://localhost:3000';

describe('Socket Session Management', () => {
    let client1: any, client2: any;
    const roomId = 'test-room-' + Date.now();

    before((done) => {
        client1 = io(SOCKET_URL);
        client2 = io(SOCKET_URL);

        let connected = 0;
        const onConnect = () => {
            connected++;
            if (connected === 2) done();
        };

        client1.on('connect', onConnect);
        client2.on('connect', onConnect);
    });

    after(() => {
        client1.disconnect();
        client2.disconnect();
    });

    it('should return room-not-found for non-existent room', (done) => {
        const nonExistentId = 'non-existent-' + Date.now();
        client1.emit('join-room', nonExistentId, { username: 'User1' });

        client1.once('room-not-found', () => {
            done();
        });
    });

    it('should create a room', (done) => {
        client1.emit('create-room', roomId, 'code');

        client1.once('room-created', (id: string) => {
            if (id === roomId) done();
        });
    });

    it('should join the created room and receive room-state', (done) => {
        client1.emit('join-room', roomId, { username: 'User1' });

        client1.once('room-state', (state: any) => {
            if (state.participants) done();
        });
    });

    it('should broadcast user-joined to other clients', (done) => {
        // Client 1 is already in. Client 2 joins.
        client2.emit('join-room', roomId, { username: 'User2' });

        client1.once('user-joined', (data: any) => {
            if (data.user.username === 'User2') done();
        });
    });

    it('should broadcast code changes', (done) => {
        const newCode = 'console.log("Hello World");';
        client1.emit('code-change', { roomId, content: newCode });

        client2.once('code-change', (content: any) => {
            if (content === newCode) done();
        });
    });
});
