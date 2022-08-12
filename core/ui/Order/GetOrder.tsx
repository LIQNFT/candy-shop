import { Card } from "react-bootstrap"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { EthereumSDK } from "../../sdk/sdk"

const sdk = new EthereumSDK()

const GetOrder = () => {
  const { register, handleSubmit } = useForm()
  const [orderResult, setOrderResult] = useState()

  const onSubmit = async (event: any) => {
    const result = await sdk.getOrder(event.uuid)
    setOrderResult(result)
  }

  return (
    <div className="App">
      {" "}
      <Card className="text-center">
        <form onSubmit={handleSubmit(onSubmit)}>
          <label>Order Uuid</label>
          <input {...register("uuid", { required: true })} />
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

export default GetOrder
