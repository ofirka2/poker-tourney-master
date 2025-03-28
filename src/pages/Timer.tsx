
import React from "react";
import Layout from "@/components/layout/Layout";
import Timer from "@/components/timer/Timer";

const TimerPage = () => {
  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[80vh]">
        <Timer className="w-full max-w-xl" />
      </div>
    </Layout>
  );
};

export default TimerPage;
