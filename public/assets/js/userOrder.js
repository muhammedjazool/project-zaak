const addressRadios = document.querySelectorAll('input[name="selectedAddress"]');
const paymentRadios = document.querySelectorAll(".payment-radio");
const placeOrderBtn = document.getElementById("place-order-btn");



addressRadios.forEach((radio) => {
     radio.addEventListener("change", handleAddressSelection);
 });
 
 paymentRadios.forEach((radio) => {
     radio.addEventListener("change", handleAddressSelection);
 });
 
 
 
 function handleAddressSelection() {
     
     const selectedAddress = document.querySelector('input[name="selectedAddress"]:checked');
     const selectedPayment = document.querySelector(".payment-radio:checked");
     
 
     if (selectedAddress && selectedPayment) {
         placeOrderBtn.disabled = false;
     } else {
         placeOrderBtn.disabled = true;
     }
 
 }


 const placeOrder = async()=>{
     try {
 
         const selectedPayment = document.querySelector(".payment-radio:checked").value;
         
         if(selectedPayment === "Cash On Delivery"){
             cashOnDelivery(selectedPayment)
         }
        
 
         
     } catch (error) {
         console.log(error.message);
     }
 }


 const cashOnDelivery = async(selectedPayment, updatedBalance)=>{
     try {
 
         const selectedAddress = document.querySelector('input[name="selectedAddress"]:checked').value;
         const subTotal = Number(document.getElementById('subTotalValue').value)
         
         const response = await fetch('/placeOrder',{
             method: 'POST',
             headers: {
                 'Content-Type': 'application/json'
             },
 
             body: JSON.stringify({
 
                 selectedAddress: selectedAddress,
                 selectedPayment: selectedPayment,
                 amount: subTotal,
                 walletBalance: updatedBalance,
                 couponData: couponData,
                 
               })
         })
 
         
 
         const orderConfirmData = await response.json()
 
         if(orderConfirmData.order ===  "Success"){
 
             window.location.href = '/orderSuccess'
             
 
         }       
         
     } catch (error) {
         console.log(error.message);
     }
 }