import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';

// ABI of the Election contract
const electionABI = [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "voter1",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "voter2",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "voter3",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "voter4",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "voter5",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "endedBy",
          "type": "address"
        }
      ],
      "name": "ElectionEnded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "voter",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "candidateId",
          "type": "uint256"
        }
      ],
      "name": "Voted",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "electionActive",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "endElection",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getVoteCounts",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_voterAddress",
          "type": "address"
        }
      ],
      "name": "getVoterStatus",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        },
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "candidateId",
          "type": "uint256"
        }
      ],
      "name": "vote",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "voters",
      "outputs": [
        {
          "internalType": "address",
          "name": "voterAddress",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "hasVoted",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "votesCandidateA",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "votesCandidateB",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];

// Replace with your deployed contract address
const electionAddress = '0x0E70a0Dd46E6e3Bb892e4A76C7cd1C73399501AC'; // Replace with your deployed contract address

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [votesA, setVotesA] = useState(0);
  const [votesB, setVotesB] = useState(0);
  const [electionStatus, setElectionStatus] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (window.ethereum) {
      const newProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(newProvider);
    } else {
      setMessage('MetaMask algılanamadı. Lütfen MetaMask yükleyin.');
    }
  }, []);

  useEffect(() => {
    if (contract) {
      fetchVoteCounts();
      checkElectionStatus();
      checkOwner();
    }
  }, [contract, account]);

  const connectWallet = async () => {
    if (!provider) {
      setMessage('Sağlayıcı başlatılmadı');
      return;
    }
    try {
      const accounts = await provider.send('eth_requestAccounts', []);
      if (accounts.length > 0) {
        const currentAccount = accounts[0];
        setAccount(currentAccount);
        const newSigner = await provider.getSigner();
        setSigner(newSigner);
        const newContract = new ethers.Contract(electionAddress, electionABI, newSigner);
        setContract(newContract);
        setMessage(`Bağlanan hesap: ${currentAccount}`);
      } else {
        setMessage('Hesap bulunamadı.');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setMessage(`Bağlantı hatası: ${error.message}`);
    }
  };

  const fetchVoteCounts = async () => {
    if (!contract) return;
    try {
      const [countA, countB] = await contract.getVoteCounts();
      setVotesA(Number(countA));
      setVotesB(Number(countB));
    } catch (error) {
      console.error('Error fetching vote counts:', error);
      setMessage(`Oy sayıları alınırken hata: ${error.message}`);
    }
  };

  const checkElectionStatus = async () => {
    if (!contract) return;
    try {
      const status = await contract.electionActive();
      setElectionStatus(status);
    } catch (error) {
      console.error('Error checking election status:', error);
      setMessage(`Seçim durumu kontrol edilirken hata: ${error.message}`);
    }
  };

  const checkOwner = async () => {
    if (!contract || !account) return;
    try {
      const ownerAddress = await contract.owner();
      setIsOwner(ownerAddress.toLowerCase() === account.toLowerCase());
    } catch (error) {
      console.error('Error checking owner:', error);
      // setMessage(`Error checking owner: ${error.message}`); // Can be noisy
    }
  };

  const handleVote = async (candidateId) => {
    if (!contract || !signer) {
      setMessage('Lütfen önce cüzdanınızı bağlayın.');
      return;
    }
    if (!electionStatus) {
      setMessage('Seçim aktif değil.');
      return;
    }
    try {
      setMessage('Oyunuz gönderiliyor...');
      const tx = await contract.connect(signer).vote(candidateId);
      await tx.wait();
      setMessage(`Aday ${candidateId === 0 ? 'A' : 'B'} için başarıyla oy verildi!`);
      fetchVoteCounts(); // Refresh counts after voting
    } catch (error) {
      console.error('Error voting:', error);
      // Prioritize error.reason or error.revert.args[0] for specific revert messages
      const revertReason = error.reason || (error.revert && error.revert.args && error.revert.args[0]);
      // Fallback to error.data.message or error.message
      const fallbackMessage = (error.data && typeof error.data.message === 'string' ? error.data.message : error.message);
      let finalMessage = revertReason || fallbackMessage;

      // Clean up common prefixes if they exist in the fallback or weren't clean in revertReason
      if (typeof finalMessage === 'string') {
        finalMessage = finalMessage.replace(/^Error: execution reverted: /i, '');
        finalMessage = finalMessage.replace(/^execution reverted: /i, '');
        // Remove quotes if the message is like "Actual message"
        if (finalMessage.startsWith('"') && finalMessage.endsWith('"')) {
          finalMessage = finalMessage.substring(1, finalMessage.length - 1);
        }
      }

      setMessage(`Oy verme başarısız: ${finalMessage || 'Beklenmeyen bir hata oluştu.'}`);
    }
  };

  const handleEndElection = async () => {
    if (!contract || !signer) {
      setMessage('Lütfen önce cüzdanınızı bağlayın.');
      return;
    }
    if (!isOwner) {
        setMessage('Sadece kontrat sahibi seçimi sonlandırabilir.');
        return;
    }
    if (!electionStatus) {
      setMessage('Seçim zaten sonlandırılmış.');
      return;
    }
    try {
      setMessage('Seçim sonlandırılıyor...');
      const tx = await contract.connect(signer).endElection();
      await tx.wait();
      setMessage('Seçim başarıyla sonlandırıldı!');
      checkElectionStatus(); // Refresh status after ending
    } catch (error) {
      console.error('Error ending election:', error);
      setMessage(`Seçim sonlandırılamadı: ${error.data ? error.data.message : error.message}`);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Merkezi Olmayan Oylama Sistemi</h1>
        {!account ? (
          <button onClick={connectWallet}>Cüzdanı Bağla</button>
        ) : (
          <p>Bağlı: {account.substring(0, 6)}...{account.substring(account.length - 4)}</p>
        )}
        {message && <p className="message">{message}</p>}
      </header>

      {contract && (
        <main>
          <section className="election-status">
            <h2>Seçim Durumu: {electionStatus ? 'Aktif' : 'Sonlandırıldı'}</h2>
          </section>

          <section className="candidates">
            <div className="candidate">
              <h2>Aday A</h2>
              {/* Placeholder for image/name */}
              <img src="/candidates/candidate_a.jpg" alt="Aday A" />
              <p>Oylar: {votesA}</p>
              {electionStatus && <button onClick={() => handleVote(0)} disabled={!electionStatus}>A'ya Oy Ver</button>}
            </div>
            <div className="candidate">
              <h2>Aday B</h2>
              {/* Placeholder for image/name */}
              <img src="/candidates/candidate_b.webp" alt="Aday B" />
              <p>Oylar: {votesB}</p>
              {electionStatus && <button onClick={() => handleVote(1)} disabled={!electionStatus}>B'ye Oy Ver</button>}
            </div>
          </section>

          <section className="controls">
            <button onClick={fetchVoteCounts}>Oy Sayılarını Yenile</button>
            {isOwner && electionStatus && (
              <button onClick={handleEndElection} className="end-election-button" disabled={!electionStatus}>
                Seçimi Sonlandır (Sadece Sahip)
              </button>
            )}
          </section>
        </main>
      )}
    </div>
  );
}

export default App;