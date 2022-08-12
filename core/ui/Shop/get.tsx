import { Card } from "react-bootstrap"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { EthereumSDK } from "../../sdk/sdk"

const sdk = new EthereumSDK()

const GetShop = () => {
  const { register, handleSubmit } = useForm()
  const [getShopResult, setGetShopResult] = useState()

  const onSubmit = async (data: any) => {
    const result = await sdk.getShop(data.uuid)
    setGetShopResult(result)
  }

  return (
    <div className="App">
      {" "}
      <Card className="text-center">
        <form onSubmit={handleSubmit(onSubmit)}>
          <label>Shop uuid</label>
          <input {...register("uuid", { required: true })} />
          <br />
          <input type="submit" />
        </form>
      </Card>
      <Card.Footer>
        <strong>Result: </strong>
        {JSON.stringify(getShopResult, null, 2)}
      </Card.Footer>
    </div>
  )
}

export default GetShop
