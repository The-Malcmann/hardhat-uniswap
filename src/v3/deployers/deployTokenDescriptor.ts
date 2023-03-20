import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { abi, bytecode } from "@uniswap/v3-periphery/artifacts/contracts/NonfungibleTokenPositionDescriptor.sol/NonfungibleTokenPositionDescriptor.json";
import { Contract, ContractFactory } from "ethers";
import { formatBytes32String } from "ethers/lib/utils";


async function deployTokenDescriptor(
  signer: SignerWithAddress,
  weth9: Contract, 
) {
  const TokenDescriptor = new ContractFactory(abi, bytecode, signer);
  console.log(TokenDescriptor)
  const tokenDescriptor = await TokenDescriptor.deploy(weth9.address, formatBytes32String("USD"));
  await tokenDescriptor.deployed();
  return { tokenDescriptor, TokenDescriptor };
}

export default deployTokenDescriptor;