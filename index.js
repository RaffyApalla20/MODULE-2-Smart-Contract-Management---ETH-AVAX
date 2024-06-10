import { useState, useEffect } from "react";
import { ethers, BigNumber } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(0); // Set balance in Ether directly
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [sliderValue, setSliderValue] = useState(1000);
  const [amount, setAmount] = useState(0); // Set amount in Ether directly
  const [recipient, setRecipient] = useState(""); // New state for recipient address
  const [isTransferring, setIsTransferring] = useState(false);
  const [notification, setNotification] = useState(""); // State for notification message

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(new ethers.providers.Web3Provider(window.ethereum));
    }
  };

  const handleAccount = async () => {
    if (ethWallet) {
      const accounts = await ethWallet.listAccounts();
      if (accounts.length > 0) {
        console.log("Account connected: ", accounts[0]);
        setAccount(accounts[0]);
        getATMContract();
      } else {
        console.log("No account found");
      }
    }
  };

  const connectAccount = async () => {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      handleAccount();
    } catch (error) {
      console.error("Error connecting account:", error);
    }
  };

  const getATMContract = async () => {
    const network = await ethWallet.getNetwork();
    console.log("Network:", network);
    if (network.chainId === 1337 || network.chainId === 31337) {
      const signer = ethWallet.getSigner();
      const atmContract = new ethers.Contract(contractAddress, atmABI, signer);
      setATM(atmContract);
    } else {
      console.error("Unsupported network");
    }
  };

  const getBalance = async () => {
    if (atm) {
      const balanceInWei = await atm.getBalance();
      const balanceInEther = ethers.utils.formatEther(balanceInWei);
      setBalance(balanceInEther); // Set balance in Ether directly
      console.log("Balance fetched: ", balanceInEther.toString(), "ETH");
    }
  };

  const executeTransaction = async (transaction) => {
    try {
      setNotification(`Please wait. Transaction in progress...`);
  
      const receipt = await transaction.wait();
      console.log("Transaction hash:", receipt.transactionHash);
      console.log("Gas used:", receipt.gasUsed.toString());
      console.log("Block number:", receipt.blockNumber);
      console.log("Confirmations:", receipt.confirmations);
  
      let transactionType = "";
      let transactionAmount = ""; // Variable to store the correct transaction amount
  
      if (transaction.type === "deposit") {
        setBalance(prevBalance => prevBalance + amount); // Update balance using amount
        transactionType = "Deposited";
        transactionAmount = amount; // Format amount in Ether
      } else if (transaction.type === "withdrawal") {
        setBalance(prevBalance => prevBalance - amount);
        transactionType = "Withdrawn";
        transactionAmount = amount; // Format amount in Ether
      }
  
      setTransactionHistory([...transactionHistory, receipt]);
      setNotification(`${transactionType} ${transactionAmount} ETH. Transaction successful. Hash: ${receipt.transactionHash}`); // Set notification message with correct transaction amount
    } catch (error) {
      console.error("Transaction error:", error);
      setNotification("Transaction failed. Please try again."); // Set notification message
    }
  };
  
  const deposit = async () => {
    if (atm) {
      try {
        const amountInWei = ethers.utils.parseEther(amount.toString()); // Convert amount to Wei
        const tx = await atm.deposit(amountInWei);
        tx.type = "deposit";
        await tx.wait();

        // Update the balance directly in Ether
        const newBalance = balance + amount;
        setBalance(newBalance);

        // Display the deposited amount in Ether in the notification
        setNotification(`Successfully deposited ${amount} ETH.`);
      } catch (error) {
        console.error("Error depositing ETH:", error);
        setNotification("Failed to deposit ETH. Please try again.");
      }
    }
  };
  

  const withdraw = async () => {
    if (atm) {
      try {
        const amountInWei = ethers.utils.parseEther(amount.toString()); // Convert amount to Wei
        const tx = await atm.withdraw(amountInWei);
        tx.type = "withdrawal";
        await tx.wait();

        // Update the balance directly in Ether
        const newBalance = balance - amount;
        setBalance(newBalance);

        // Display the withdrawn amount in Ether in the notification
        setNotification(`Successfully withdrawn ${amount} ETH.`);
      } catch (error) {
        console.error("Error withdrawing ETH:", error);
        setNotification("Failed to withdraw ETH. Please try again.");
      }
    }
  };
  

  const transfer = async () => {
    setIsTransferring(true);
    if (ethWallet && recipient && amount) {
      try {
        const signer = ethWallet.getSigner();
        const amountInWei = ethers.utils.parseEther(amount.toString()); // Convert amount to Wei
        const transaction = await signer.sendTransaction({
          to: recipient,
          value: amountInWei,
        });
        await transaction.wait();
        setNotification(`Successfully transferred ${amount} ETH.`); // Display transferred amount in ETH format
      } catch (error) {
        console.error("Error transferring ETH:", error);
        setNotification("Failed to transfer ETH. Please try again.");
      } finally {
        setIsTransferring(false);
      }
    } else {
      console.error("Invalid recipient address or transfer amount.");
      setNotification("Please provide a valid recipient address and transfer amount.");
      setIsTransferring(false);
    }
  };
  

  const handleSliderChange = (event) => {
    const newValue = parseInt(event.target.value);
    setSliderValue(newValue);
    setAmount(newValue);
  };

  const handleRecipientChange = (event) => { // Function to handle recipient input change
    setRecipient(event.target.value);
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>WELCOME TO MY WALLET</h1>
      </header>
      {ethWallet && !account && (
        <button onClick={connectAccount}>Please connect your wallet</button>
      )}
      {account && (
        <div>
          <p>Your Account: {
account}</p>
<p>Your Balance: {balance} ETH</p>
<input
  type="text"
  placeholder="Recipient Address"
  value={recipient}
  onChange={handleRecipientChange}
/>
<input
  type="range"
  min="100"
  max="10000"
  step="100"
  value={sliderValue.toString()}
  onChange={handleSliderChange}
/>
<p>Amount: {amount} ETH</p>
<button onClick={deposit}>Deposit</button>
<button onClick={withdraw}>Withdraw</button>
<button onClick={transfer}>Transfer</button> {/* New transfer button */}
</div>
)}
{/* Notification display */}
{notification && (
<div className="notification">
{notification}
</div>
)}
<style jsx>{`
.container {
text-align: center;
}
.notification {
margin-top: 10px;
padding: 10px;
background-color: #e2f7cb;
border: 1px solid #8aca67;
border-radius: 5px;
color: #4f8a10;
}
`}</style>
</main>
);
}
