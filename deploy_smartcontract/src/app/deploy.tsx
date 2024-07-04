"use client";
import React, { useEffect, useState } from 'react';
import { createPublicClient, http, Hex } from 'viem';
import nero from './Nero.json';
import { baseSepolia, polygonAmoy, sepolia} from 'viem/chains';
import { useAccount, useChainId, useWalletClient } from 'wagmi';
import axios from 'axios';

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

const Deploy = () => {
  const { address: userAddress } = useAccount();
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient({ chainId });

  const [tokenAddress, setTokenAddress] = useState<`0x${string}` | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [isDeployed, setIsDeployed] = useState(false);

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
    constructorArguments: string,
    licenseType: string
  ) {
    const apiKey = "7CU2HZAY6VD1CIG7C5DD8N4TKWZ7JJ7SVT";

    const params = new URLSearchParams();
    params.append('apikey', apiKey);
    params.append('module', 'contract');
    params.append('action', 'verifysourcecode');
    params.append('contractaddress', contractAddress);
    params.append('sourceCode', contractSourceCode);
    params.append('codeformat', 'solidity-single-file');
    params.append('contractname', contractName);
    params.append('compilerversion', compilerVersion);
    params.append('optimizationUsed', '0'); // Change to '1' if optimization was used
    params.append('runs', '200'); // Change to the number of runs if optimization was used
    params.append('constructorArguments', constructorArguments);
    params.append('licenseType', licenseType);

    try {
      const response = await axios.post('https://api-sepolia.basescan.org/api', params.toString());
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

  async function deploy721A(
    name: string,
		symbol: string,
		contractDetails: (string | number)[],
		baseUri: string
  ) {
    if (!walletClient) {
      throw new Error('Wallet client is not available');
    }

    const hash = await walletClient.deployContract({
      abi: nero.abi,
      bytecode: nero.bytecode as Hex,
      account: userAddress,
      // args: [platformFee, memory_name, '0xe58b70db9baed3d1eac99e9ae4a8173bfa2e01d5']
			args: [name, symbol, '0xba76e0b301d0b3a1a972a7a09aeb1165d8d04ee7', '0x9d4a23da70c84cde233f504b8c2047ed753cf582', '0xe6b8a5CF854791412c1f6EFC7CAf629f5Df1c747', contractDetails, baseUri]
      // args: ['0xf5d0A178a61A2543c98FC4a73E3e78a097DBD9EE']
    });

    if (!hash) {
      throw new Error('Failed to execute deploy contract transaction');
    }
    console.log("hash", hash)
    const txn = await publicClient.waitForTransactionReceipt({ hash });
    console.log('transaction result is', txn, txn.to);
    setTokenAddress(txn.contractAddress as `0x${string}`);
    setIsDeployed(true);

    return txn.contractAddress;
  }

  const handleDeploy = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    try {
      const contractDetailsString = ["10000000000000000", 100, 300, 6];
			const contractDetails = contractDetailsString.map((item, index) => {
				if (index === 0) {
					return item; // Keep the first element as a string
				} else {
					const num = Number(item);
					return isNaN(num) ? item : num;
				}
			});

			console.log(contractDetails);
      const contractAddress = await deploy721A('Hanovery', "AC", contractDetails, "www.baseuri.com");
      // const contractAddress = await deploy721A(30, 'NFT BAZAAR');
      console.log('Contract deployed at:', contractAddress);
    } catch (error) {
      setError('Error deploying contract: ' + error);
      console.error('Error deploying contract:', error);
    }
  };

  const handleVerify = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    if (!tokenAddress) {
      setError('No contract address found to verify.');
      return;
    }
    const contractSourceCode = `// SPDX-License-Identifier: MIT
    // Original license: SPDX_License_Identifier: MIT

    pragma solidity ^0.8.20;

    interface IAccessControl {
      error AccessControlUnauthorizedAccount(address account, bytes32 neededRole);
      error AccessControlBadConfirmation();
      event RoleAdminChanged(bytes32 indexed role, bytes32 indexed previousAdminRole, bytes32 indexed newAdminRole);
      event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender);
      event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender);
      function hasRole(bytes32 role, address account) external view returns (bool);
      function getRoleAdmin(bytes32 role) external view returns (bytes32);
      function grantRole(bytes32 role, address account) external;
      function revokeRole(bytes32 role, address account) external;
      function renounceRole(bytes32 role, address callerConfirmation) external;
    }

    abstract contract Context {
      function _msgSender() internal view virtual returns (address) {
        return msg.sender;
      }

      function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
      }

      function _contextSuffixLength() internal view virtual returns (uint256) {
        return 0;
      }
    }

    interface IERC165 {
      function supportsInterface(bytes4 interfaceId) external view returns (bool);
    }

    abstract contract ERC165 is IERC165 {
      function supportsInterface(bytes4 interfaceId) public view virtual returns (bool) {
        return interfaceId == type(IERC165).interfaceId;
      }
    }

    abstract contract AccessControl is Context, IAccessControl, ERC165 {
      struct RoleData {
        mapping(address => bool) members;
        bytes32 adminRole;
      }

      mapping(bytes32 => RoleData) private _roles;

      bytes32 public constant DEFAULT_ADMIN_ROLE = 0x00;

      modifier onlyRole(bytes32 role) {
        _checkRole(role);
        _;
      }

      function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return interfaceId == type(IAccessControl).interfaceId || super.supportsInterface(interfaceId);
      }

      function hasRole(bytes32 role, address account) public view virtual override returns (bool) {
        return _roles[role].members[account];
      }

      function _checkRole(bytes32 role) internal view virtual {
        _checkRole(role, _msgSender());
      }

      function _checkRole(bytes32 role, address account) internal view virtual {
        if (!hasRole(role, account)) {
          revert AccessControlUnauthorizedAccount(account, role);
        }
      }

      function getRoleAdmin(bytes32 role) public view virtual override returns (bytes32) {
        return _roles[role].adminRole;
      }

      function grantRole(bytes32 role, address account) public virtual override onlyRole(getRoleAdmin(role)) {
        _grantRole(role, account);
      }

      function revokeRole(bytes32 role, address account) public virtual override onlyRole(getRoleAdmin(role)) {
        _revokeRole(role, account);
      }

      function renounceRole(bytes32 role, address callerConfirmation) public virtual override {
        if (callerConfirmation != _msgSender()) {
          revert AccessControlBadConfirmation();
        }
        _revokeRole(role, callerConfirmation);
      }

      function _setRoleAdmin(bytes32 role, bytes32 adminRole) internal virtual {
        bytes32 previousAdminRole = getRoleAdmin(role);
        _roles[role].adminRole = adminRole;
        emit RoleAdminChanged(role, previousAdminRole, adminRole);
      }

      function _grantRole(bytes32 role, address account) internal virtual {
        if (!hasRole(role, account)) {
          _roles[role].members[account] = true;
          emit RoleGranted(role, account, _msgSender());
        }
      }

      function _revokeRole(bytes32 role, address account) internal virtual {
        if (hasRole(role, account)) {
          _roles[role].members[account] = false;
          emit RoleRevoked(role, account, _msgSender());
        }
      }
    }

    interface IAccessControlEnumerable is IAccessControl {
      function getRoleMember(bytes32 role, uint256 index) external view returns (address);
      function getRoleMemberCount(bytes32 role) external view returns (uint256);
    }

    library EnumerableSet {
      struct Set {
        bytes32[] _values;
        mapping(bytes32 => uint256) _indexes;
      }

      function _add(Set storage set, bytes32 value) private returns (bool) {
        if (!_contains(set, value)) {
          set._values.push(value);
          set._indexes[value] = set._values.length;
          return true;
        } else {
          return false;
        }
      }

      function _remove(Set storage set, bytes32 value) private returns (bool) {
        uint256 valueIndex = set._indexes[value];
        if (valueIndex != 0) {
          uint256 toDeleteIndex = valueIndex - 1;
          uint256 lastIndex = set._values.length - 1;

          if (lastIndex != toDeleteIndex) {
            bytes32 lastValue = set._values[lastIndex];
            set._values[toDeleteIndex] = lastValue;
            set._indexes[lastValue] = valueIndex;
          }

          set._values.pop();
          delete set._indexes[value];

          return true;
        } else {
          return false;
        }
      }

      function _contains(Set storage set, bytes32 value) private view returns (bool) {
        return set._indexes[value] != 0;
      }

      function _length(Set storage set) private view returns (uint256) {
        return set._values.length;
      }

      function _at(Set storage set, uint256 index) private view returns (bytes32) {
        return set._values[index];
      }

      function _values(Set storage set) private view returns (bytes32[] memory) {
        return set._values;
      }

      struct Bytes32Set {
        Set _inner;
      }

      function add(Bytes32Set storage set, bytes32 value) internal returns (bool) {
        return _add(set._inner, value);
      }

      function remove(Bytes32Set storage set, bytes32 value) internal returns (bool) {
        return _remove(set._inner, value);
      }

      function contains(Bytes32Set storage set, bytes32 value) internal view returns (bool) {
        return _contains(set._inner, value);
      }

      function length(Bytes32Set storage set) internal view returns (uint256) {
        return _length(set._inner);
      }

      function at(Bytes32Set storage set, uint256 index) internal view returns (bytes32) {
        return _at(set._inner, index);
      }

      function values(Bytes32Set storage set) internal view returns (bytes32[] memory) {
        return _values(set._inner);
      }

      struct AddressSet {
        Set _inner;
      }

      function add(AddressSet storage set, address value) internal returns (bool) {
        return _add(set._inner, bytes32(uint256(uint160(value))));
      }

      function remove(AddressSet storage set, address value) internal returns (bool) {
        return _remove(set._inner, bytes32(uint256(uint160(value))));
      }

      function contains(AddressSet storage set, address value) internal view returns (bool) {
        return _contains(set._inner, bytes32(uint256(uint160(value))));
      }

      function length(AddressSet storage set) internal view returns (uint256) {
        return _length(set._inner);
      }

      function at(AddressSet storage set, uint256 index) internal view returns (address) {
        return address(uint160(uint256(_at(set._inner, index))));
      }

      function values(AddressSet storage set) internal view returns (address[] memory) {
        bytes32[] memory store = _values(set._inner);
        address[] memory result;

        assembly {
          result := store
        }

        return result;
      }
    }
  `;
    try {
      await verifyContract(
        tokenAddress as string,
        contractSourceCode,
        'AccessMaster', // Contract name
        'v0.8.26+commit.8a97fa7a', 
        '0xf5d0A178a61A2543c98FC4a73E3e78a097DBD9EE',
        'MIT'
      );
    } catch (error) {
      setError('Error verifying contract: ' + error);
      console.error('Error verifying contract:', error);
    }
  };

  return (
    <main className="flex items-center justify-between p-24">
      <w3m-button />
      <form>
        <label className="text-5xl text-white">Deploy Smart Contract</label> <br />
        <button
          className="p-2 px-6 bg-white text-black rounded-full mt-10 text-2xl"
          onClick={handleDeploy}
        >
          Deploy
        </button>
      </form>
      {isDeployed && (
        <button
          className="p-2 px-6 bg-white text-black rounded-full mt-10 text-2xl"
          onClick={handleVerify}
        >
          Verify
        </button>
      )}
      {tokenAddress && <p className="text-white mt-4">Contract Address: {tokenAddress}</p>}
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </main>
  );
};

export default Deploy;
