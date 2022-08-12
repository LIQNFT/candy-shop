import { useState } from "react"
import { Button, Card } from "react-bootstrap"
import { useForm } from "react-hook-form"
import { EthereumSDK } from "../../sdk/sdk"

const sdk = new EthereumSDK()

const Consumption = () => {
  const { register, handleSubmit } = useForm()
  // usetstate for storing and retrieving wallet details
  const [wallet, setWallet] = useState({
    address: "",
  })

  const [consumptionResult, setConsumptionResult] = useState()

  const btnhandler = () => {
    if (window.ethereum) {
      window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then((res: any) => accountChangeHandler(res[0]))
    } else {
      alert("install metamask extension!!")
    }
  }

  const accountChangeHandler = (account: any) => {
    setWallet({
      address: account,
    })
  }

  const onSubmit = async (event: any) => {
    let accounts
    if (window.ethereum) {
      accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
    } else {
      alert("install metamask extension!!")
    }
    const result = await sdk.makeOrderConsumptionSignature(
      window.ethereum,
      event.consumptionUuid,
      accounts[0],
    )
    setConsumptionResult(result)
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
          <label>consumptionUuid</label>
          <input {...register("consumptionUuid", { required: true })} />
          <br />
          <input type="submit" />
        </form>
        <Card.Footer>
          <strong>Result: </strong>
          {JSON.stringify(consumptionResult, null, 2)}
        </Card.Footer>
      </Card>
    </div>
  )
}

export default Consumption
