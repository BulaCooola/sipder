import React from "react";
import workflowHTML from "../assets/workflow.js";

function Workflow() {
  return <div dangerouslySetInnerHTML={{ __html: workflowHTML }} />;
}

// Proof of concept mission execution

export default Workflow;
