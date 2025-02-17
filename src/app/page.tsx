import Flow from "@/components/Flow";
import { ReactFlowProvider } from "@xyflow/react";

function Home() {
  return (
    <>
      <ReactFlowProvider>
        <Flow />
      </ReactFlowProvider>
    </>
  );
}

export default Home;
