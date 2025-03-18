
import React from "react";
import Layout from "@/components/layout/Layout";
import { TimerDisplay } from "@/components/timer/Timer";

const Timer = () => {
  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[80vh]">
        <TimerDisplay fullscreen={true} />
      </div>
    </Layout>
  );
};

export default Timer;
