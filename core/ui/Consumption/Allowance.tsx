import { useState } from "react"
import { Card } from "react-bootstrap"
import { useForm } from "react-hook-form"
import { EthereumSDK } from "../../sdk/sdk"

const sdk = new EthereumSDK()

const ConsumptionAllowance = () => {
  const { register, handleSubmit } = useForm()
  const [allowanceResult, setAllowanceResult] = useState<string>()

  const onSubmit = async (event: any) => {
    let accounts
    if (window.ethereum) {
      accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
    } else {
      alert("install metamask extension!!")
    }

    const { transactionHash } = await sdk.makeConsumptionAllowance(
      window.ethereum,
      event.consumptionUuid,
      accounts[0],
    )

    setAllowanceResult(transactionHash)
  }

  return (
    <div className="App">
      {" "}
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

export default ConsumptionAllowance
