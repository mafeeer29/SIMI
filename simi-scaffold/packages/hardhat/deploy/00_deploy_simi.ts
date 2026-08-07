import { deployScript, artifacts } from "../rocketh/deploy.js";

/**
 * Deploys the SIMI smart contract.
 *
 * The deployer automatically receives DEFAULT_ADMIN_ROLE
 * inside the SIMI constructor.
 */
export default deployScript(
  async env => {
    const { deployer } = env.namedAccounts;

    const simi = await env.deploy("SIMI", {
      account: deployer,
      artifact: artifacts.SIMI,
      args: [],
    });

    console.log("SIMI deployed at:", simi.address);
    console.log("Admin / deployer:", deployer);
  },
  {
    tags: ["SIMI"],
  },
);
