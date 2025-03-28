
import React from "react";
import Layout from "@/components/layout/Layout";
import Timer from "@/components/timer/Timer";

const TimerPage = () => {
  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[80vh]">
        <Timer fullscreen={true} />
      </div>
    </Layout>
  );
};

export default TimerPage;
