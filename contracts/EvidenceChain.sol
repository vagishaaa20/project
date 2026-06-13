// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EvidenceChain {

    struct Evidence {
        string caseId;
        string evidenceId;
        string hash;        // SHA-256 hash of video
        uint256 timestamp;  // block timestamp when added
        bool exists;        // to prevent overwrite
    }

    // evidenceId => Evidence
    mapping(string => Evidence) private evidenceRecords;

    event EvidenceAdded(
        string indexed evidenceId,
        string caseId,
        string hash,
        uint256 timestamp
    );

    // ---------------- ADD EVIDENCE ----------------
    function addEvidence(
        string memory _caseId,
        string memory _evidenceId,
        string memory _hash
    ) public {
        // Prevent overwriting existing evidence
        require(
            !evidenceRecords[_evidenceId].exists,
            "Evidence already exists"
        );

        evidenceRecords[_evidenceId] = Evidence(
            _caseId,
            _evidenceId,
            _hash,
            block.timestamp,
            true
        );

        emit EvidenceAdded(_evidenceId, _caseId, _hash, block.timestamp);
    }

    // ---------------- VERIFY HASH ----------------
    function getEvidenceHash(
        string memory _evidenceId
    ) public view returns (string memory) {
        require(
            evidenceRecords[_evidenceId].exists,
            "Evidence not found"
        );
        return evidenceRecords[_evidenceId].hash;
    }

    // ---------------- OPTIONAL: FULL DETAILS ----------------
    function getEvidence(
        string memory _evidenceId
    )
        public
        view
        returns (
            string memory caseId,
            string memory evidenceId,
            string memory hash,
            uint256 timestamp
        )
    {
        require(
            evidenceRecords[_evidenceId].exists,
            "Evidence not found"
        );

        Evidence memory e = evidenceRecords[_evidenceId];
        return (e.caseId, e.evidenceId, e.hash, e.timestamp);
    }
}
