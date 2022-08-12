import { useForm } from "react-hook-form"
// Importing module
import React, { useState } from "react"
import { Button, Card } from "react-bootstrap"
import { EthereumSDK } from "../../sdk/sdk"

const sdk = new EthereumSDK()

const CreateOrder = () => {
  // usetstate for storing and retrieving wallet details
  const [wallet, setWallet] = useState({
    address: "",
  })

  const [requestResult, setRequestResult] = useState()

  // Button handler button for handling a
  // request event for metamask
  const btnhandler = () => {
    // Asking if metamask is already present or not
    if (window.ethereum) {
      // res[0] for fetching a first wallet
      window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then((res: any) => accountChangeHandler(res[0]))
    } else {
      alert("install metamask extension!!")
    }
  }

  // Function for getting handling all events
  const accountChangeHandler = (account: any) => {
    // Setting an address data
    setWallet({
      address: account,
    })
  }
  const { register, handleSubmit } = useForm()

  const onSubmit = async (event: any) => {
    // event.preventDefault();
    const result = await sdk.createOrder(wallet.address, event)
    setRequestResult(result)
  }

  return (
    <div>
      {" "}
      {/* Calling all values which we have stored in usestate */}{" "}
      <Card className="text-center">
        <Card.Header>
          <strong>Address: </strong> {wallet.address}
        </Card.Header>
        <Card.Body>
          <Button onClick={btnhandler} variant="primary">
            {" "}
            Connect to wallet{" "}
          </Button>
        </Card.Body>
        <form onSubmit={handleSubmit(onSubmit)}>
          <label>shopUuid</label>
          <input {...register("shopUuid", { required: true })} />
          <br />
          <label>Offer asset address</label>
          <input {...register("offerNftAsset.address", { required: true })}></input>
          <br />
          <label>Offer asset type</label>
          <input {...register("offerNftAsset.type", { required: true })} />
          <br />
          <label>Offer asset symbol</label>
          <input {...register("offerNftAsset.symbol", { required: true })}></input>
          <br />
          <label>Offer asset tokenId</label>
          <input {...register("offerNftAsset.tokenId", { required: true })} />
          <br />
          <label>Payment asset address</label>
          <input {...register("consumptionPaymentAssets[0].address", { required: true })} />
          <br />
          <label>Payment asset type</label>
          <input {...register("consumptionPaymentAssets[0].type", { required: true })} />
          <br />
          <label>Payment asset symbol</label>
          <input {...register("consumptionPaymentAssets[0].symbol", { required: true })} />
          <br />
          <label>Payment asset value</label>
          <input {...register("consumptionPaymentAssets[0].value", { required: true })} />
          <br />
          <label>Network Id</label>
          <input {...register("networkId", { required: true })} />
          <br />
          <input type="submit" />
        </form>
        <Card.Footer>
          <strong>Result: </strong>
          {JSON.stringify(requestResult, null, 2)}
        </Card.Footer>
      </Card>
    </div>
  )
}

export default CreateOrder
