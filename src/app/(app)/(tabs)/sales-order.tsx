import { useAuth } from '@/hooks/use-auth'
import DealerProductsScreen from '@/modules/sales-order/components/sales-order-screen'

const SalesOrder = () => {

  const { user } = useAuth()

  // if (!hasAccessToModule("abcd", false, user!)) {
  //   return <Redirect href={"/"} />
  // }

  return (
    <DealerProductsScreen />
  )
}

export default SalesOrder