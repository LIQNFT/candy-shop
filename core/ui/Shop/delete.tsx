import { Card } from "react-bootstrap"
import { useForm } from "react-hook-form"
import { EthereumSDK } from "../../sdk/sdk"

const sdk = new EthereumSDK()

const DeleteShop = () => {
  const { register, handleSubmit } = useForm()

  const onSubmit = async (event: any) => {
    let accounts
    if (window.ethereum) {
      accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
    } else {
      alert("install metamask extension!!")
    }
    await sdk.deleteShop(window.ethereum, event, accounts[0])
  }

  return (
    <div className="App">
      {" "}
      <Card className="text-center">
        <form onSubmit={handleSubmit(onSubmit)}>
          <label>Shop Uuid</label>
          <input {...register("uuid", { required: true })} />
          <br />
          <input type="submit" />
        </form>
      </Card>
    </div>
  )
}

export default DeleteShop
