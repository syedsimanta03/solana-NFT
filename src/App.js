import React, {useState} from "react";
import "./App.css";
import twitterLogo from "./assets/twitter-logo.svg";
import CandyMachine from "./CandyMachine";

// Constants
const TWITTER_HANDLE = "_buildspace";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {

  const [walletAddress, setWalletAddress] = useState(null)

  const checkWalletIsConnected = async () => {
    try {
      const {solana} = window
      if (solana) {
        if (solana.isPhantom) {
           console.log('Phantom connected');
           const response = await solana.connect({onlyIftrusted: true})
           setWalletAddress(response.publicKey.toString());
        } else {
          alert('Phantom Wallet not connected')
        }
      }

    } catch (error) {
      console.log(error);
    }
  }

  const connectWallet = async() => {
     const {solana} = window
      if (solana) {
      const response = await solana.connect()
        setWalletAddress(response.publicKey.toString());
        console.log('connectWallet()', walletAddress);
      }
  }

  const renderNotConnectedContainer = () => (
    <button className="cta-button connect-wallet-button" onClick={connectWallet}>Connect Wallet</button>
 )

  React.useEffect(() => {
    const onLoad = async () => {
      await checkWalletIsConnected()
    }  
    window.addEventListener('load', onLoad)
    return () => window.removeEventListener('load', onLoad)
  }, [])
  
  console.log('walletAddress-window.solana', window.solana);

	return (
		<div className="App">
			<div className="container">
				<div className="header-container">
					<p className="header">🍭 Candy Drop</p>
					<p className="sub-text">NFT drop machine with fair mint</p>
          {!walletAddress && renderNotConnectedContainer()}
          {walletAddress && <CandyMachine walletAddress={window.solana}/>}
				</div>
				<div className="footer-container">
					<img
						alt="Twitter Logo"
						className="twitter-logo"
						src={twitterLogo}
					/>
					<a
						className="footer-text"
						href={TWITTER_LINK}
						target="_blank"
						rel="noreferrer"
					>{`Adapted from @${TWITTER_HANDLE}`}</a>
				</div>
			</div>
		</div>
	);
};

export default App;
