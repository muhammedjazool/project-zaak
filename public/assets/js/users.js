const totalPrice = async (id, act, stock) => {
    
    
    const elem = document.getElementById(id);
    
    
    if (act == "inc") {
          elem.value ? (elem.value = Number(elem.value) + 1) : "";
    }
    else if (act == "dec"){
          elem.value > 1 ? (elem.value = Number(elem.value) - 1) : "";
        }

    let subTotal = 0;
    let datas = [];
    let length = document.getElementsByName("productTotal").length;
    
    
    for (let i = 0; i < length; i++) {
        
        const quantity = parseFloat(document.getElementsByName("num-product")[i].value);
       
        const price = parseFloat(document.getElementsByName("productprice")[i].value);
        
        const productTotal = isNaN(quantity) || isNaN(price) ? 0 : quantity * price;
        
        document.getElementsByName("productTotal")[i].innerText = "₹ " + productTotal.toFixed();
        subTotal += productTotal;
      

        datas.push({
            id: document.getElementsByName("productId")[i].value,
            quantity: Number(document.getElementsByName("num-product")[i].value),
        });
    }
    
    // console.log(document.getElementById("subTotal")); 
   
    document.getElementById("subTotal").innerText = "₹ " + subTotal.toFixed();
    document.getElementById("subTotal2").innerText = "₹ " + subTotal.toFixed();
    
    let data = await fetch("/cartUpdation", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            datas,
        }),
    });
};




const removeCartalert = async (id) => {
    console.log(49,"rma");
     const productId = document.getElementById("product_id" + id).value;
     console.log(4,"rma",productId);
     const cartId = document.getElementById("cart_id").value;
     console.log(6,"rma",cartId)
     const idObj = { proId: productId, cartId: cartId };
     console.log(8,"rma",idObj);
 
     const result = await Swal.fire({
        title: "Remove item from cart",
        text: "Do you want to remove this product from your cart?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6", 
        cancelButtonColor: "#d33", 
        confirmButtonText: "Cancel", 
        cancelButtonText: "Yes, remove", 
        showDenyButton: false,
    });
    

    if (result.dismiss === Swal.DismissReason.cancel) {
        removeFromCart(productId, cartId);
    }
 };


 const removeFromCart = async (productId, cartId) => {
    console.log(75,"rfc");
    const response = await fetch(`/removeFromCart?productId=${productId}&cartId=${cartId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    
    if (response.ok) {
        Swal.fire({
            icon: "success",
            title: "Product has been removed successfully",
            showConfirmButton: true,
            confirmButtonText: "OK",
            confirmButtonColor: "#4CAF50",
        });
        document.getElementById("row" + productId).innerHTML = "";
    }
};



   
    addressForm.addEventListener("submit", async function (event) {
        const addressForm = document.getElementById("addressForm");
       
        event.preventDefault();

       const  formData=new FormData(event.target)
       
       resetErrorMessage();
       try{
        const response=await axios.post("/addNewAddress",formData,{
            headers:{
                "Content-Type":"application/json",
            },
        });
        if(response.status===200){
            
            const result = await Swal.fire({
                icon: "success",
                title: "Successfully added new address",
                showConfirmButton: true,
                confirmButtonText: "OK",
                confirmButtonColor: "#4CAF50",
            });
            if (result.value) {
                
                form.reset();
                location.reload();
            }
        } else {
            
            Swal.fire({
                icon: "error",
                title: "Some error occured",
                showConfirmButton: true,
                confirmButtonText: "CANCEL",
                confirmButtonColor: "#D22B2B",
            });
        }
       }catch(error){
           if(error.response.status===400){
            
            const validationErrors = error.response.data.error;
            Object.keys(validationErrors).forEach((key)=>{
                document.getElementById(key).textContent=validationErrors[key]
            })
           }else{
             
             alert("something went wrong")
           
           }
       }

    });


function resetErrorMessage() {
    const errorElements = document.querySelectorAll(".error-msg");
    errorElements.forEach((element) => {
      element.textContent = "";
    });
  }


 
  ////////////delete Address/////////////
 