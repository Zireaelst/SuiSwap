const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CrossChainHTLC", function () {
    let htlc, token, owner, addr1;

    beforeEach(async function () {
        [owner, addr1] = await ethers.getSigners();

        // Deploy test ERC20
        const Token = await ethers.getContractFactory("ERC20Mock");
        token = await Token.deploy("Test Token", "TEST", 18);

        // Deploy HTLC
        const HTLC = await ethers.getContractFactory("CrossChainHTLC");
        htlc = await HTLC.deploy();

        // Setup tokens
        await token.mint(owner.address, ethers.parseEther("1000"));
        await token.approve(htlc.address, ethers.parseEther("1000"));
    });

    it("Should create HTLC order", async function () {
        const preimage = "0x1234567890abcdef";
        const hashlock = ethers.keccak256(preimage);
        const timelock = Math.floor(Date.now() / 1000) + 3600; // 1 hour
        const suiOrderId = ethers.keccak256("0xsui123");

        const tx = await htlc.createHTLC(
            token.address,
            ethers.parseEther("100"),
            hashlock,
            timelock,
            suiOrderId
        );

        const receipt = await tx.wait();
        const event = receipt.events?.find(e => e.event === "HTLCCreated");
        expect(event).to.exist;
    });
});
