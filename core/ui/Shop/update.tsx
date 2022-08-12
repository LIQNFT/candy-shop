import { Card } from "react-bootstrap"
import { useForm } from "react-hook-form"
import { EthereumSDK } from "../../sdk/sdk"
import { useState } from "react"

const sdk = new EthereumSDK()

const UpdateShop = () => {
  const [shopResult, setShopResult] = useState()
  const { register, handleSubmit } = useForm()

  const onSubmit = async (event: any) => {
    let accounts
    if (window.ethereum) {
      accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
    } else {
      alert("install metamask extension!!")
    }

    const result = await sdk.updateShop(window.ethereum, event, accounts[0])
    setShopResult(result.result)
  }

  return (
    <div className="App">
      {" "}
      <Card className="text-center">
        <form onSubmit={handleSubmit(onSubmit)}>
          <label>Shop Uuid</label>
          <input {...register("uuid", { required: true })} />
          <br />
          <label>Shop Name</label>
          <input {...register("name", { required: true })} />
          <br />
          <label>Shop logo url</label>
          <input {...register("logoUrl", { required: true })} />
          <br />
          <label>Seller percentage</label>
          <input {...register("percentage.seller", { required: true })} />
          <br />
          <label>Shop owner percentage</label>
          <input {...register("percentage.shopOwner", { required: true })} />
          <br />
          <label>Platform percentage</label>
          <input {...register("percentage.platform", { required: true })} />
          <br />
          <input type="submit" />
        </form>
      </Card>
      <Card.Footer>
        <strong>Result: </strong>
        {JSON.stringify(shopResult, null, 2)}
      </Card.Footer>
    </div>
  )
}

export default UpdateShop
