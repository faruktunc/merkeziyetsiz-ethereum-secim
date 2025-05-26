// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

contract Election {
    address public owner;

    struct Voter {
        address voterAddress;
        bool hasVoted;
    }

    Voter[5] public voters;

    uint256 public votesCandidateA;
    uint256 public votesCandidateB;

    bool public electionActive;

    event Voted(address indexed voter, uint indexed candidateId);
    event ElectionEnded(address indexed endedBy);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier electionIsOpen() {
        require(electionActive, "Election is not active");
        _;
    }

    constructor(
        address voter1,
        address voter2,
        address voter3,
        address voter4,
        address voter5
    ) {
        owner = msg.sender;
        electionActive = true;

        voters[0] = Voter(voter1, false);
        voters[1] = Voter(voter2, false);
        voters[2] = Voter(voter3, false);
        voters[3] = Voter(voter4, false);
        voters[4] = Voter(voter5, false);
    }

    function vote(uint candidateId) public electionIsOpen {
        bool foundVoter = false;
        uint voterIndex;

        for (uint i = 0; i < voters.length; i++) {
            if (voters[i].voterAddress == msg.sender) {
                foundVoter = true;
                voterIndex = i;
                break;
            }
        }

        require(foundVoter, "Not an authorized voter");
        require(!voters[voterIndex].hasVoted, "Voter has already voted");
        require(candidateId == 0 || candidateId == 1, "Invalid candidate ID");

        voters[voterIndex].hasVoted = true;

        if (candidateId == 0) {
            votesCandidateA++;
        } else {
            votesCandidateB++;
        }
        emit Voted(msg.sender, candidateId);
    }

    function getVoteCounts() public view returns (uint256, uint256) {
        return (votesCandidateA, votesCandidateB);
    }

    function endElection() public onlyOwner {
        require(electionActive, "Election already ended");
        electionActive = false;
        emit ElectionEnded(msg.sender);
    }

    // Helper function to get voter details - useful for testing/UI
    function getVoterStatus(address _voterAddress) public view returns (bool, bool) {
        for (uint i = 0; i < voters.length; i++) {
            if (voters[i].voterAddress == _voterAddress) {
                return (true, voters[i].hasVoted); // isRegistered, hasVoted
            }
        }
        return (false, false); // Not registered
    }
}