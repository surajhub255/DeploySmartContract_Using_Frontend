"use client";
import React, { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import axios from 'axios';


const Verify = () => {
  const { address: userAddress } = useAccount();
  // const tokenAddress = "0xe90e7968520fB085B693C699F09B2f1418EC4e49"
  const tokenAddress = "0xfe7a9053326642380794d2d2f31a43c84e20fa6f"
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userAddress) {
      console.log(userAddress);
    }
  }, [userAddress]);

  async function verifyContract(
    contractAddress: string,
    contractSourceCode: string,
    contractName: string,
    compilerVersion: string,
    constructorArguments: string
  ) {
    // const apiKey = "RBNWT988E1EQS41KEP1P4GIHP279Y1TU7I";
    const apiKey = "I4P2814JMQ4JEFNQQR6DCGIVUEW4DMVTIW";

    const params = new URLSearchParams();
    params.append('apikey', apiKey);
    params.append('module', 'contract');
    params.append('action', 'verifysourcecode');
    params.append('contractaddress', contractAddress);
    params.append('sourceCode', contractSourceCode);
    params.append('codeformat', 'solidity-single-file');
    params.append('contractname', contractName);
    params.append('compilerversion', compilerVersion);
    params.append('optimizationUsed', '0');
    params.append('runs', '200');
    params.append('constructorArguments', constructorArguments);

    try {
      // const response = await axios.post('https://api-sepolia.etherscan.io/api', params.toString());
      const response = await axios.post('https://api-amoy.polygonscan.com/api', params.toString());
      console.log(apiKey);
      console.log(contractAddress);
      console.log(contractSourceCode);
      console.log(contractName);
      console.log(compilerVersion);
      if (response.data.status === '1') {
        console.log('Contract verified successfully');
        console.log('Verification response:', response);
        console.log('Verification Guid:', response.data.result);
      } else {
        console.log('Failed to verify contract:', response.data.result);
      }
    } catch (error) {
      console.error('Error verifying contract:', error);
    }
  }



  const handleVerify = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    if (!tokenAddress) {
      setError('No contract address found to verify.');
      return;
    }
    const contractSourceCode = `pragma solidity ^0.8.24;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract Nero is ERC721A, Ownable, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("NERO_SCOREBOARD_UPDATER");

    mapping(uint256 => uint256) public scoreboard; // mapping between the NFT and the number of visits
    bool public locked = false;
    uint256 public maxSupply;
    string public unlockedGlbURI; // unlocked avatar - token holder access only
    string public unlockedBackgroundURI; // unlocked background - token holder access only

    string public lockedGlbURI; // locked avatar - public access
    string public lockedBackgroundURI; // locked backround - public access

    string public tokenURILink; // single token URI

    string public publicKnowledgeLink; // link to public knowledge configuration for agent

    string public privateKnowledgeLink; // link to private knowledge configuration for token-gated content

    string public metadataURI; // metadata 

    uint256 public pricePerTokenMint;

    uint256 public bronzeTierUnlock = 10; // 10 people visit, unlock dance move 1
    uint256 public silverTierUnlock = 100; // 100 people visit, unlock dance move 2
    uint256 public goldTierUnlock = 200; // 200 people visit, unlock dance move 3

    constructor(
        string memory name,
        string memory symbol,
        uint256 supply,
        uint256 price, // price to be paid for nft
        address nero, // our public key so we can auto-update scoreboard
        uint256 bronzeLevel,
        uint256 silverLevel,
        uint256 goldLevel
    ) ERC721A(name, symbol) Ownable(msg.sender) {
        maxSupply = supply;
        _grantRole(MINTER_ROLE, nero);
        pricePerTokenMint = price;

        require(bronzeLevel > 0 && silverLevel > bronzeLevel && goldLevel > silverLevel, 'invalid level configuration');

        bronzeTierUnlock = bronzeLevel;
        silverTierUnlock = silverLevel;
        goldTierUnlock = goldLevel;
    }

    modifier unlocked() {
        require(!locked, "nft already locked");

        _;
    }

    function updateScoreboard(
        uint256 nftId,
        uint256 total
    ) external onlyRole(MINTER_ROLE) {
        require(
            scoreboard[nftId] < total,
            "cannot reduce the scoreboard must be bigger total"
        );
        require(_exists(nftId), "nft not exists");
        scoreboard[nftId] = total;
    }

    function mint(uint256 quantity) external payable {
        require(
            _totalMinted() < maxSupply && maxSupply > 0,
            "no more tokens to mint"
        );
        require(
            _totalMinted() + quantity <= maxSupply && maxSupply > 0,
            "cannot mint more than max supply"
        );
        require(msg.value == pricePerTokenMint * quantity, "please pay required amount to mint");
       
        _mint(msg.sender, quantity);
    }

    /// lock the access to the NFT; once locked you can't unlock it

    function lock() public onlyOwner {
        require(!locked, "already locked");
        locked = true;
    }

    /// return the token URI of the locked GLB

    function tokenURI(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        if (!_exists(tokenId)) _revert(URIQueryForNonexistentToken.selector);

        return
            bytes(metadataURI).length != 0
                ? string(abi.encodePacked(metadataURI))
                : "";
    }

    /// Settings for user content against the NFT
    /// locked content stores the 'uri' of the encrypted content
    /// LIT is used to unlock this access based on NFT token holder

    function updateUnlockedGlb(
        string memory _unlockedGlbURI
    ) public onlyOwner unlocked {
        unlockedGlbURI = _unlockedGlbURI;
    }

    function updateUnlockedBackground(
        string memory _unlockedBackgroundURI
    ) public onlyOwner unlocked {
        unlockedBackgroundURI = _unlockedBackgroundURI;
    }

    function updateLockedGlb(
        string memory _lockedGlbURI
    ) public onlyOwner unlocked {
        lockedGlbURI = _lockedGlbURI;
    }

    function updateLockedBackground(
        string memory _lockedBackgroundURI
    ) public onlyOwner unlocked {
        lockedBackgroundURI = _lockedBackgroundURI;
    }

    function updateMetadata(
        string memory _unlockedGlbURI,
        string memory _unlockedBackgroundURI,
        string memory _lockedGlbURI,
        string memory _lockedBackgroundURI,
        string memory _publicKnowlegeURI,
        string memory _privateKnowledgeURI,
        string memory _metadataURI
    ) public onlyOwner unlocked {
        lockedBackgroundURI = _lockedBackgroundURI;
        lockedGlbURI = _lockedGlbURI;
        unlockedBackgroundURI = _unlockedBackgroundURI;
        unlockedGlbURI = _unlockedGlbURI;
        publicKnowledgeLink = _publicKnowlegeURI;
        privateKnowledgeLink = _privateKnowledgeURI;
        metadataURI = _metadataURI;
        lock();
    }

    // Sneaker animations: 1-F_Dances_001, 2-005, 3-006, 4-007 & 
    // Guitar Animations: 5-M_Dances_005, 6-008, 7-009 & 8-F_Dances_007
    // if not these no dancing

    function getDanceMove(uint256 tokenId) public view returns(uint256) {
        require(_exists(tokenId), 'token does not exist');

        if (scoreboard[tokenId] < bronzeTierUnlock) {
            return 0; // normal
        }
        if (scoreboard[tokenId] < silverTierUnlock) {
            return 1; // bronze tier
        }
        if (scoreboard[tokenId] < goldTierUnlock) {
            return 2; // silver tier
        }

        return 3; // gold tier
    }

    /// Interface overrides

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC721A, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}`;
    try {
      await verifyContract(
        tokenAddress as string,
        contractSourceCode,
        'Nero', // Contract name
        'v0.8.0+commit.c7dfd78e', // Compiler version
        ''
      );
    } catch (error) {
      setError('Error verifying contract: ' + error);
      console.error('Error verifying contract:', error);
    }
  };

  return (
    <main className="flex items-center justify-between p-24">
      <button
        className="p-2 px-6 bg-white text-black rounded-full mt-10 text-2xl"
        onClick={handleVerify}
      >
        Verify
      </button>
      {tokenAddress && <p className="text-white mt-4">Contract Address: {tokenAddress}</p>}
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </main>
  );
};

export default Verify;
