async function main() {
  // Get the deployer's account (this will be the owner of the contract)
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contract with the account:", deployer.address);

  // Define placeholder addresses for the 5 voters required by the constructor.
  // These should be replaced with actual addresses for a real deployment.
  const voter1 = "0xf92fB8cd835863dda16D98209584Fcdb0418C62a";
  const voter2 = "0x5E80903c8e9ac162C41DB551aB94F589e3b8d356";
  const voter3 = "0x6742cCF044a6397586D95f049ca8e50c7d881c93";
  const voter4 = "0x9480768dB61bEAD334B6D72D0Bb03260e09bE789";
  const voter5 = "0x1CcF9196794F56862C7D9682048ff25C3652126E";

  console.log("Initializing contract with voters:");
  console.log("  Voter 1:", voter1);
  console.log("  Voter 2:", voter2);
  console.log("  Voter 3:", voter3);
  console.log("  Voter 4:", voter4);
  console.log("  Voter 5:", voter5);

  // Get the contract factory for "Election"
  const Election = await ethers.getContractFactory("Election");

  // Deploy the contract with the specified voter addresses
  const election = await Election.deploy(voter1, voter2, voter3, voter4, voter5);

  // Wait for the deployment transaction to be mined
  await election.waitForDeployment();

  // Log the address of the deployed contract
  console.log("Election contract deployed to:", await election.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });