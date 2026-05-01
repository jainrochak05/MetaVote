// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MetaVote {
    uint256 public constant REGISTRATION_FEE = 500 ether;

    struct Candidate {
        string name;
        string manifesto;
        uint256 voteCount;
        address wallet;
    }

    Candidate[] private candidates;
    mapping(address => bool) public hasVoted;
    mapping(address => uint256) public votes;
    mapping(address => bool) public isCandidate;

    event CandidateRegistered(uint256 indexed candidateId, address indexed wallet, string name, string manifesto);
    event Voted(address indexed voter, uint256 indexed candidateId);

    function registerCandidate(string calldata name, string calldata manifesto) external payable {
        require(msg.value == REGISTRATION_FEE, "Fee must be 500 ETH");
        require(bytes(name).length > 0, "Name required");
        require(bytes(manifesto).length > 0, "Manifesto required");
        require(!isCandidate[msg.sender], "Already registered");

        candidates.push(Candidate({
            name: name,
            manifesto: manifesto,
            voteCount: 0,
            wallet: msg.sender
        }));
        isCandidate[msg.sender] = true;

        emit CandidateRegistered(candidates.length - 1, msg.sender, name, manifesto);
    }

    function vote(uint256 candidateId) external {
        require(!hasVoted[msg.sender], "Already voted");
        require(!isCandidate[msg.sender], "Candidates cannot vote");
        require(candidateId < candidates.length, "Invalid candidate");

        hasVoted[msg.sender] = true;
        votes[msg.sender] = candidateId;
        candidates[candidateId].voteCount += 1;

        emit Voted(msg.sender, candidateId);
    }

    function getAllCandidates() external view returns (Candidate[] memory) {
        return candidates;
    }

    function getMyVote() external view returns (bool voted, uint256 candidateId) {
        return (hasVoted[msg.sender], votes[msg.sender]);
    }

    function getResults()
        external
        view
        returns (
            string[] memory names,
            uint256[] memory voteCounts,
            address[] memory wallets,
            string[] memory manifestos
        )
    {
        uint256 count = candidates.length;
        names = new string[](count);
        voteCounts = new uint256[](count);
        wallets = new address[](count);
        manifestos = new string[](count);

        for (uint256 i = 0; i < count; i++) {
            Candidate memory candidate = candidates[i];
            names[i] = candidate.name;
            voteCounts[i] = candidate.voteCount;
            wallets[i] = candidate.wallet;
            manifestos[i] = candidate.manifesto;
        }
    }
}
