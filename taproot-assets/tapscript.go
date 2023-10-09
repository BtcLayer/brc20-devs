package taprootassets

import (
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
    "crypto/sha256"
	"fmt"
	"math/big"
	"log"

	"github.com/btcsuite/btcd/txscript"
	"github.com/btcsuite/btcd/wire"
)


func tapscript_gen() {

    //Generate a public and private key pair
    privKey, _ := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)

    pubkeyBytes := elliptic.Marshal(privKey.PublicKey.Curve, privKey.PublicKey.X, privKey.PublicKey.Y)
    pubkeyHex := fmt.Sprintf("%x", pubkeyBytes)

    fmt.Printf("Private Key: %x\nPublic_Key: %s\n", privKey.D, pubkeyHex)


    contract := "Alice agrees to pay 10BTC to bob"

    t := sha256.Sum256([]byte(contract))
    fmt.Sprintf("Tweak from the original contract: %x\n\n", t)


    // Create Q_key by tweaking the public key
    Q_key := new(ecdsa.PublicKey)
    Q_key.Curve = privKey.Curve
    Q_key.X, Q_key.Y = privKey.Curve.ScalarBaseMult(t[:])
    
    // Create q_key by adding the tweak to the private key
    q_key := new(ecdsa.PrivateKey)
    q_key.PublicKey.Curve = privKey.Curve
    q_key.D = new(big.Int).SetBytes(privKey.D.Bytes())
    q_key.D.Add(q_key.D, new(big.Int).SetBytes(t[:]))

    fmt.Printf("Tweaked private key: %x\nTweaked public key (X coordinate only): %x\n", q_key.D, Q_key.X)

}





