// Test suite for CrossChainHTLC contract
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("CrossChainHTLC", function () {
  let htlc;
  let owner, alice, bob, treasury;
  let testToken;
  
  const TIMELOCK_DURATION = 7200; // 2 hours
  const SECRET = "mysecret123";
  const HASHLOCK = ethers.keccak256(ethers.toUtf8Bytes(SECRET));
  const SUI_ORDER_ID = ethers.keccak256(ethers.toUtf8Bytes("sui_order_123"));

  beforeEach(async function () {
    [owner, alice, bob, treasury] = await ethers.getSigners();

    // Deploy CrossChainHTLC with treasury
    const CrossChainHTLC = await ethers.getContractFactory("CrossChainHTLC");
    htlc = await CrossChainHTLC.deploy(treasury.address);
    await htlc.waitForDeployment();
  });

  describe("Contract Deployment", function () {
    it("Should set the right treasury", async function () {
      expect(await htlc.fusionPlusTreasury()).to.equal(treasury.address);
    });

    it("Should set default Fusion+ fee", async function () {
      expect(await htlc.fusionPlusFee()).to.equal(30); // 0.3%
    });
  });

  describe("HTLC Creation", function () {
    it("Should create HTLC with ETH", async function () {
      const amount = ethers.parseEther("1");
      const timelock = (await time.latest()) + TIMELOCK_DURATION;

      const tx = await htlc.connect(alice).createHTLC(
        bob.address,
        ethers.ZeroAddress,
        amount,
        HASHLOCK,
        timelock,
        SUI_ORDER_ID,
        { value: amount }
      );

      const receipt = await tx.wait();
      
      // Check event emission
      expect(receipt.logs).to.have.lengthOf.greaterThan(0);
      
      // Get order ID from transaction hash (simplified for test)
      const orderId = ethers.keccak256(ethers.concat([
        ethers.solidityPacked(['address'], [alice.address]),
        ethers.solidityPacked(['address'], [bob.address]),
        ethers.solidityPacked(['address'], [ethers.ZeroAddress]),
        ethers.solidityPacked(['uint256'], [amount]),
        ethers.solidityPacked(['bytes32'], [HASHLOCK]),
        ethers.solidityPacked(['uint256'], [timelock]),
        ethers.solidityPacked(['uint256'], [await time.latest()]),
        ethers.solidityPacked(['bytes32'], [SUI_ORDER_ID])
      ]));

      const canWithdraw = await htlc.canWithdraw(orderId);
      expect(canWithdraw).to.be.true;
    });

    it("Should fail with invalid timelock", async function () {
      const amount = ethers.parseEther("1");
      const timelock = await time.latest(); // Too short

      await expect(
        htlc.connect(alice).createHTLC(
          bob.address,
          ethers.ZeroAddress,
          amount,
          HASHLOCK,
          timelock,
          SUI_ORDER_ID,
          { value: amount }
        )
      ).to.be.revertedWith("Timelock too short");
    });

    it("Should fail with zero recipient", async function () {
      const amount = ethers.parseEther("1");
      const timelock = (await time.latest()) + TIMELOCK_DURATION;

      await expect(
        htlc.connect(alice).createHTLC(
          ethers.ZeroAddress,
          ethers.ZeroAddress,
          amount,
          HASHLOCK,
          timelock,
          SUI_ORDER_ID,
          { value: amount }
        )
      ).to.be.revertedWith("Invalid recipient");
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to update Fusion+ fee", async function () {
      const newFee = 50; // 0.5%
      await htlc.connect(owner).setFusionPlusFee(newFee);
      expect(await htlc.fusionPlusFee()).to.equal(newFee);
    });

    it("Should prevent high fees", async function () {
      await expect(
        htlc.connect(owner).setFusionPlusFee(1001) // > 10%
      ).to.be.revertedWith("Fee too high");
    });

    it("Should allow owner to update treasury", async function () {
      const newTreasury = bob.address;
      await htlc.connect(owner).setFusionPlusTreasury(newTreasury);
      expect(await htlc.fusionPlusTreasury()).to.equal(newTreasury);
    });

    it("Should prevent setting zero address as treasury", async function () {
      await expect(
        htlc.connect(owner).setFusionPlusTreasury(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid treasury address");
    });
  });
});
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
