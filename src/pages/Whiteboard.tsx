import { AppLayout } from '@/components/layout/AppLayout';
import { WhiteboardCanvas } from '@/components/whiteboard/WhiteboardCanvas';

const Whiteboard = () => {
  return (
    <AppLayout>
      <div className="flex-1 flex flex-col h-[calc(100vh-4rem)]">
        <WhiteboardCanvas isRoom={false} />
      </div>
    </AppLayout>
  );
};

export default Whiteboard;
