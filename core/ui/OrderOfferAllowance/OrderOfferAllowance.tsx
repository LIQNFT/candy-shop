import { useState } from "react"
import { Card } from "react-bootstrap"
import { useForm } from "react-hook-form"
import { EthereumSDK } from "../../sdk/sdk"

const sdk = new EthereumSDK()

const OrderOfferAllowance = () => {
  const { register, handleSubmit } = useForm()
  const [allowanceResult, setAllowanceResult] = useState<string>()

  const onSubmit = async (event: any) => {
    // event.preventDefault();
    let accounts
    if (window.ethereum) {
      // res[0] for fetching a first wallet
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
    } else {
      alert("install metamask extension!!")
    }

    const { transactionHash } = await sdk.makeOfferAllowance(
      window.ethereum,
      event.consumptionUuid,
      accounts[0],
    )

    setAllowanceResult(transactionHash)
  }

  return (
    <div className="App">
      {" "}
      {/* Calling all values which we have stored in usestate */}{" "}
      <Card className="text-center">
        <form onSubmit={handleSubmit(onSubmit)}>
          <label>Consumption uuid</label>
          <input {...register("consumptionUuid", { required: true })} />
          <br />
          <input type="submit" />
        </form>
        <Card.Footer>
          <strong>Result: </strong>
          {JSON.stringify(allowanceResult, null, 2)}
        </Card.Footer>
      </Card>
    </div>
  )
}

export default OrderOfferAllowance
