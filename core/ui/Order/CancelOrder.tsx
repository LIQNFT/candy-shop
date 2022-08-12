import { Card } from "react-bootstrap"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { EthereumSDK } from "../../sdk/sdk"

const sdk = new EthereumSDK()

const CancelOrder = () => {
  const { register, handleSubmit } = useForm()
  const [orderResult, setOrderResult] = useState<string>()

  const onSubmit = async (event: any) => {
    let accounts
    if (window.ethereum) {
      accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
    } else {
      alert("install metamask extension!!")
    }

    const { transactionHash } = await sdk.cancelOrder(window.ethereum, event.orderUuid, accounts[0])

    setOrderResult(transactionHash)
  }

  return (
    <div className="App">
      {" "}
      <Card className="text-center">
        <form onSubmit={handleSubmit(onSubmit)}>
          <label>Order Uuid</label>
          <input {...register("orderUuid", { required: true })} />
          <br />
          <input type="submit" />
        </form>
      </Card>
      <Card.Footer>
        <strong>Result: </strong>
        {JSON.stringify(orderResult, null, 2)}
      </Card.Footer>
    </div>
  )
}

export default CancelOrder
