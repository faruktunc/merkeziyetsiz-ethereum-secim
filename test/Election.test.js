const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Election Contract", function () {
    let Election;
    let election;
    let owner, voter1, voter2, voter3, voter4, voter5, nonVoter;

    // Provided private keys for voters
    const voter1PrivKey = "0x4e06318f941c42195816cb1fa2c245844eea00c7019ee404187ef4a1139f6ed9";
    const voter2PrivKey = "0xaf7fdf441dfcf57e21f25133f09f8c0dc086637592a432c7f038af8188c8f332";
    const voter3PrivKey = "0x99698bc3b8ddb65a60560a903393afa4cfe7d72081b705efdf02b9d1c7f2b76a";
    const voter4PrivKey = "0x052b10b05122e8e9fd3c0eb59a65021971654f0a62050ea8b8f4922f392ac8dd";
    const voter5PrivKey = "0xced6a79eda188ea7e5e246548864764627bdc3652bb6527dd0889bae6a2183c0";

    // Candidate IDs
    const CANDIDATE_A_ID = 0;
    const CANDIDATE_B_ID = 1;

    beforeEach(async function () {
        // Get a default signer for owner and a non-voter account
        const signers = await ethers.getSigners();
        owner = signers[0];
        nonVoter = signers[signers.length - 1]; // Use the last available signer as nonVoter

        // Create wallet instances for specified voters
        voter1 = new ethers.Wallet(voter1PrivKey, ethers.provider);
        voter2 = new ethers.Wallet(voter2PrivKey, ethers.provider);
        voter3 = new ethers.Wallet(voter3PrivKey, ethers.provider);
        voter4 = new ethers.Wallet(voter4PrivKey, ethers.provider);
        voter5 = new ethers.Wallet(voter5PrivKey, ethers.provider);

        // Fund the voter accounts
        const fundAmount = ethers.parseEther("1.0"); // Send 1 ETH
        const votersToFund = [voter1, voter2, voter3, voter4, voter5];
        for (const voter of votersToFund) {
            await owner.sendTransaction({ to: voter.address, value: fundAmount });
        }

        // Ensure nonVoter is not one of the specified voters or the owner
        const voterAddresses = [
            owner.address.toLowerCase(),
            voter1.address.toLowerCase(),
            voter2.address.toLowerCase(),
            voter3.address.toLowerCase(),
            voter4.address.toLowerCase(),
            voter5.address.toLowerCase()
        ];
        if (voterAddresses.includes(nonVoter.address.toLowerCase())) {
            // If nonVoter conflicts, try to find another signer or create a random wallet
            // For simplicity in this test environment, we'll assume signers[signers.length-1] is usually distinct enough
            // or that Hardhat provides enough accounts. If not, this might need a more robust solution.
            console.warn("Warning: nonVoter account might conflict with owner or a designated voter. Ensure enough distinct accounts are available in Hardhat.");
            // As a fallback, create a random wallet if all signers are used up
            if (signers.length <= 6) { // owner + 5 voters
                 nonVoter = ethers.Wallet.createRandom().connect(ethers.provider);
            }
        }

        // Log addresses for debugging
         //console.log("Owner:", owner.address);
         //console.log("Voter1:", voter1.address, "Expected: 0xf92fB8cd835863dda16D98209584Fcdb0418C62a");
        // console.log("Voter2:", voter2.address, "Expected: 0x5E80903c8e9ac162C41DB551aB94F589e3b8d356");
         //console.log("Voter3:", voter3.address, "Expected: 0x6742cCF044a6397586D95f049ca8e50c7d881c93");
         //console.log("Voter4:", voter4.address, "Expected: 0x9480768dB61bEAD334B6D72D0Bb03260e09bE789");
         //console.log("Voter5:", voter5.address, "Expected: 0x1CcF9196794F56862C7D9682048ff25C3652126E");
         //console.log("NonVoter:", nonVoter.address);

        Election = await ethers.getContractFactory("Election");
        election = await Election.deploy(
            voter1.address,
            voter2.address,
            voter3.address,
            voter4.address,
            voter5.address
        );
        await election.waitForDeployment();
    });

    it("1. Sözleşme başarılı bir şekilde ağa yüklenebiliyor mu?", async function () {
        expect(await election.getAddress()).to.not.be.null;
        expect(await election.getAddress()).to.be.properAddress;
        // console.log("Contract deployed to:", await election.getAddress());
    });

    it("2. Bir seçmen başarılı bir şekilde oyunu kullanabiliyor mu?", async function () {
        await expect(election.connect(voter1).vote(CANDIDATE_A_ID))
            .to.emit(election, "Voted")
            .withArgs(voter1.address, CANDIDATE_A_ID);
        const voterStatus = await election.getVoterStatus(voter1.address);
        expect(voterStatus[1]).to.equal(true); // hasVoted should be true
    });

    it("3. Seçmen olmayan bir hesaptan gelen bir işlemin talebi başarısızlıkla sonuçlanıyor mu?", async function () {
        await expect(election.connect(nonVoter).vote(CANDIDATE_A_ID))
            .to.be.revertedWith("Not an authorized voter");
    });

    it("4. Daha önce oy kullanmış bir seçmenin tekrar oy kullanma girişimi başarısızlıkla sonuçlanıyor mu?", async function () {
        await election.connect(voter1).vote(CANDIDATE_A_ID);
        await expect(election.connect(voter1).vote(CANDIDATE_B_ID))
            .to.be.revertedWith("Voter has already voted");
    });

    it("5. Oy verme işlemi başarılı bir şekilde sonuçlandığında ilgili adayın sayacı bir artıyor mu?", async function () {
        await election.connect(voter1).vote(CANDIDATE_A_ID);
        const [votesA, votesB] = await election.getVoteCounts();
        expect(votesA).to.equal(1);
        expect(votesB).to.equal(0);

        await election.connect(voter2).vote(CANDIDATE_B_ID);
        const [newVotesA, newVotesB] = await election.getVoteCounts();
        expect(newVotesA).to.equal(1);
        expect(newVotesB).to.equal(1);
    });

    it("6. İki seçmen belli bir aday için oy kullandığında ilgili adayın sayaç değeri iki artıyor mu?", async function () {
        await election.connect(voter1).vote(CANDIDATE_A_ID);
        await election.connect(voter2).vote(CANDIDATE_A_ID);
        const [votesA, votesB] = await election.getVoteCounts();
        expect(votesA).to.equal(2);
        expect(votesB).to.equal(0);
    });

    it("7. Sözleşmeyi oluşturan hesabın dışında bir hesap oy vermeyi sonlandırmaya çalıştığında başarısızlıkla sonuçlanıyor mu?", async function () {
        await expect(election.connect(voter1).endElection())
            .to.be.revertedWith("Only owner can call this function");
    });

    it("8. Daha önce oy kullanmamış bir seçmen oy verme sonlandırıldıktan sonra oy vermeye çalıştığında başarısızlıkla sonuçlanıyor mu?", async function () {
        await election.connect(owner).endElection();
        expect(await election.electionActive()).to.equal(false);
        await expect(election.connect(voter1).vote(CANDIDATE_A_ID))
            .to.be.revertedWith("Election is not active");
    });

    // Additional test: Ensure only valid candidate IDs are accepted
    it("Geçersiz aday ID'si ile oy kullanma girişimi başarısız olmalı", async function () {
        await expect(election.connect(voter1).vote(2))
            .to.be.revertedWith("Invalid candidate ID");
    });

    // Additional test: Check initial vote counts
    it("Başlangıçta oy sayıları sıfır olmalı", async function () {
        const [votesA, votesB] = await election.getVoteCounts();
        expect(votesA).to.equal(0);
        expect(votesB).to.equal(0);
    });

    // Additional test: Check election status after ending
    it("Seçim sonlandırıldıktan sonra seçim durumu 'false' olmalı", async function () {
        await election.connect(owner).endElection();
        expect(await election.electionActive()).to.equal(false);
        await expect(election.connect(owner).endElection())
            .to.be.revertedWith("Election already ended"); // Try to end again
    });

    // Additional test: getVoterStatus for non-registered voter
    it("Kayitli olmayan bir secmen icin getVoterStatus (false, false) donmeli", async function () {
        const status = await election.getVoterStatus(nonVoter.address);
        expect(status[0]).to.equal(false); // isRegistered
        expect(status[1]).to.equal(false); // hasVoted
    });

    // Additional test: getVoterStatus for registered but not voted voter
    it("Kayitli ama oy kullanmamis bir secmen icin getVoterStatus (true, false) donmeli", async function () {
        const status = await election.getVoterStatus(voter3.address);
        expect(status[0]).to.equal(true); // isRegistered
        expect(status[1]).to.equal(false); // hasVoted
    });
});