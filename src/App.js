import React from "react";
import "./App.css";
import twitterLogo from "./assets/twitter-logo.svg";

// Constants
const TWITTER_HANDLE = "_buildspace";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {

  const checkWalletIsConnected = async () => {
    try {
      const {solana} = window
      if (solana) {
        if (solana.isPhantom) {
           console.log('Phantom connected');
           const response = await solana.connect({onlyIftrusted: true})
           console.log('Connected with Public key: ', response.publicKey.toString());
        } else {
          alert('Phantom Wallet not connected')
        }
      }

    } catch (error) {
      console.log(error);
    }
  }

  const connectWallet = async() => {
    console.log('connect wallet fun');
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
  


	return (
		<div className="App">
			<div className="container">
				<div className="header-container">
					<p className="header">🍭 Candy Drop</p>
					<p className="sub-text">NFT drop machine with fair mint</p>
          {renderNotConnectedContainer()}
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
