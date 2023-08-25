const totalPrice = async (id, act, stock) => {
  const elem = document.getElementById(id);

  const isStock = document.getElementById(stock);
 
  if (act == "inc") {
    elem.value ? (elem.value = Number(elem.value) + 1) : "";
    
      const response= handleIncreaseButtonClick(id, stock); // Pass the correct productId and stock
      
  } else if (act == "dec") {
    elem.value > 1 ? (elem.value = Number(elem.value) - 1) : "";
  }
  let subTotal = 0;
  let datas = [];
  let length = document.getElementsByName("productTotal").length;

  for (let i = 0; i < length; i++) {
    const quantity = parseFloat(
      document.getElementsByName("num-product")[i].value
    );

    const price = parseFloat(
      document.getElementsByName("productprice")[i].value
    );

    const productTotal = isNaN(quantity) || isNaN(price) ? 0 : quantity * price;

    document.getElementsByName("productTotal")[i].innerText =
      "₹ " + productTotal.toFixed();
    subTotal += productTotal;

    datas.push({
      id: document.getElementsByName("productId")[i].value,
      quantity: Number(document.getElementsByName("num-product")[i].value),
    });
  }

  document.getElementById("subTotal").innerText = "₹ " + subTotal.toFixed();
  document.getElementById("subTotal2").innerText = "₹ " + subTotal.toFixed();

  let data = await fetch("/updateCart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      datas,
    }),
  });
};

async function handleIncreaseButtonClick(productId, selectedSize) {
  try {
    const response = await fetch(
      `/getStock?productId=${productId}&size=${selectedSize}`
    );
    const stockData = await response.json();
  

    const quantityElement = document.getElementById(productId);


    const quantity = parseFloat(quantityElement.value);


    const stock = stockData.stock;
 
    if (quantity + 1 <= stock) {
       return 1
      // Update the total price and other UI elements
    } else {
      Swal.fire({
        icon: "error",
        title: "Out of stock",
        text: "The selected quantity is not available.",
        confirmButtonText: "OK",
      });
    }
  } catch (error) {
    console.error(error);
  }
}

const removeCartalert = async (id,size) => {
  const productId = document.getElementById("product_id" + id).value;

  const cartId = document.getElementById("cart_id").value;

  const idObj = { proId: productId, cartId: cartId };

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
    removeFromCart(productId, cartId,size);
  }
};

const removeFromCart = async (productId, cartId,size) => {
  const response = await fetch(
    `/removeFromCart?productId=${productId}&cartId=${cartId}&size=${size}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (response.ok) {
    Swal.fire({
      icon: "success",
      title: "Product has been removed successfully",
      showConfirmButton: true,
      confirmButtonText: "OK",
      confirmButtonColor: "#4CAF50",
    });
    document.getElementById("row" + productId).innerHTML = "";
    updateTotalAmount();
  }
};


function updateTotalAmount() {
  let subTotal = 0;

  const quantityElements = document.getElementsByName("num-product");
  const priceElements = document.getElementsByName("productprice");

  for (let i = 0; i < quantityElements.length; i++) {
    const quantity = parseFloat(quantityElements[i].value);
    const price = parseFloat(priceElements[i].value);
    const productTotal = isNaN(quantity) || isNaN(price) ? 0 : quantity * price;
    subTotal += productTotal;
  }

  const subTotalElements = document.querySelectorAll("#subTotal, #subTotal2");
  subTotalElements.forEach((element) => {
    element.innerText = "₹ " + subTotal.toFixed(2);
  });
}




const addressForm = document.getElementById("addressForm");
addressForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const formData = new FormData(event.target);

  resetErrorMessage();
  try {
    const response = await axios.post("/addNewAddress", formData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.status === 200) {
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
  } catch (error) {
    if (error.response.status === 400) {
      const validationErrors = error.response.data.error;
      Object.keys(validationErrors).forEach((key) => {
        document.getElementById(key).textContent = validationErrors[key];
      });
    } else {
      alert("something went wrong");
    }
  }
});

function resetErrorMessage() {
  const errorElements = document.querySelectorAll(".error-msg");
  errorElements.forEach((element) => {
    element.textContent = "";
  });
}









////////filter////////////////

async function filteredData(data) {
  const productList = document.getElementById('productList');
  productList.innerHTML = ''; // Clear existing products

  data.forEach((product) => {
    productList.innerHTML +=
      `
      <div class="product product-list">
        <div class="row">
          <div class="col-6 col-lg-3">
            <figure class="product-media">
              <span class="product-label label-new">New</span>
              <a href="/productView?id=${product._id}">
                <img src="${product.imageUrl[0].url}" alt="Product image" class="product-image">
              </a>
            </figure><!-- End .product-media -->
          </div><!-- End .col-sm-6 col-lg-3 -->

          <div class="col-6 col-lg-3 order-lg-last mt-3">
            <div class="product-list-action">
              <div class="product-price">
                $${product.price}
              </div><!-- End .product-price -->
              <div class="ratings-container">
                <div class="ratings">
                  <div class="ratings-val" style="width: 20%;"></div>
                  <!-- End .ratings-val -->
                </div><!-- End .ratings -->
                <span class="ratings-text">(2 Reviews)</span>
              </div><!-- End .rating-container -->

              <a href="/productView?id=${product._id}" class="btn-product btn-cart">
                <span>View Product</span>
              </a>
            </div><!-- End .product-list-action -->
          </div><!-- End .col-sm-6 col-lg-3 -->

          <div class="col-lg-6 mt-4">
            <div class="product-body product-action-inner">
              <h3 class="product-title">
                <a href="#">${product.name}</a>
              </h3><!-- End .product-title -->

              <div class="product-content">
                <p>${product.shortDescription}</p>
                <div class="product-nav product-nav-thumbs mt-5">
                  <a href="/productView?id=${product._id}" class="active">
                    <img src="${product.imageUrl[1].url}" alt="product desc">
                  </a>
                  <a href="/productView?id=${product._id}">
                    <img src="${product.imageUrl[2].url}" alt="product desc">
                  </a>
                  <a href="/productView?id=${product._id}">
                    <img src="${product.imageUrl[3].url}" alt="product desc">
                  </a>
                </div><!-- End .product-nav -->
              </div><!-- End .product-content -->
            </div><!-- End .product-body -->
          </div><!-- End .col-lg-6 -->
        </div><!-- End .row -->
      </div><!-- End .product -->
      `;
  });
}


async function displayOriginalProducts() {
  const response = await fetch('/originalProductData'); // Create a route to fetch original product data
 
}
  
 async function  categoryFilter  (categoryId){
    console.log(291);
  const response = await fetch(`/categoryFilter?categoryId=${categoryId}`,{
      headers: {
          "Content-Type": "application/json",
      },
  })

  const data = await response.json()

  if( data.length>0 ){
      filteredData(data)
  }else{
      productContainer.innerHTML = 
      
      `<div class="products mb-3" id="productList">
          <div class="row justify-content-center">

          
          <div class="col-6 col-md-4 col-lg-4">
              <div class="product product-7 text-center">
      
                  <div class="error-content text-center">
                      <div class="container">
                          <h1 class="error-title">Error 404</h1><!-- End .error-title -->
                          <p>We are sorry, the page you've requested is not available.</p>
                          <a href="/home" class="btn btn-outline-primary-2 btn-minwidth-lg">
                              <span>BACK TO HOMEPAGE</span>
                              <i class="icon-long-arrow-right"></i>
                          </a>
                      </div><!-- End .container -->
                  </div><!-- End .error-content text-center -->
              </div>
          </div>
          </div>
      </div>`

  }
}


async function subCategoryFilter(subCategoryId,isChecked){
  
  const response = await fetch(`/subCategoryFilter?subCategoryId=${subCategoryId}`,{
      headers: {
          "Content-Type": "application/json",
      },
  })

  const data = await response.json()

  if( data.length>0 ){
    if (isChecked) {
      filteredData(data);
    } else {
      displayOriginalProducts(); // Display the original products when checkbox is unchecked
    }
  }else{
      productContainer.innerHTML = 
      
      `<div class="products mb-3" id="productList">
          <div class="row justify-content-center">

          
          <div class="col-6 col-md-4 col-lg-4">
              <div class="product product-7 text-center">
      
                  <div class="error-content text-center">
                      <div class="container">
                          <h1 class="error-title">Error 404</h1><!-- End .error-title -->
                          <p>We are sorry, the page you've requested is not available.</p>
                          <a href="/home" class="btn btn-outline-primary-2 btn-minwidth-lg">
                              <span>BACK TO HOMEPAGE</span>
                              <i class="icon-long-arrow-right"></i>
                          </a>
                      </div><!-- End .container -->
                  </div><!-- End .error-content text-center -->
              </div>
          </div>
          </div>
      </div>`

  }
}



async function sortProducts(category){
   const categoryData=category
 
  const selectElement = document.getElementById("sortOptions");
  const selectedValue = selectElement.value;
 
  if(selectedValue === 'relevent'){
  
      location.reload()
  }else{
 
      const response = await fetch('/sortProduct', {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({
              sort: selectedValue,
              categoryId: categoryData
          }),
      });
      
      const data = await response.json()
    
      filteredData(data)
  }   
}

async function sortOfferProducts(productData) {
  try {
      const selectElement = document.getElementById("sortOption");
      const selectedValue = selectElement.value;

      if (selectedValue === 'relevent') {
          location.reload();
      } else {
          const response = await fetch('/sortOfferProducts', {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
              },
              body: JSON.stringify({
                  sort: selectedValue,
                  product: productData
              }),
          });

          const data = await response.json();
          filteredData(data);
      }
  } catch (error) {
      console.log(error);
  }
}





///////////////address//////////////////

const handleProfile = async (event) => {
  event.preventDefault();

  const formData = new FormData(event.target);
 
  resetError();
  try {
       const response = await axios.post("/verifyProfile", formData, {
            headers: {
                 'Content-Type': 'application/json'
            }
       });

       if (response.status === 200) {
            window.location.href = "/jazool";
       }
  } catch (error) {
       if (error.response.status === 400) {
            const validationErrors = error.response.data.error;
            Object.keys(validationErrors).forEach((key) => {
                 document.getElementById(key).textContent = validationErrors[key];
            });
       } else {
            alertify.alert("Something went wrong", function () {
                 alertify.message("OK");
            });
       }
  }
}

document.getElementById('profileForm').addEventListener("submit", handleProfile);

function resetError() {
  const errorElements = document.querySelectorAll(".error-msg");
  errorElements.forEach((element) => {
       element.textContent = "";
  });
}



///edit adres////

const editAddressBtns = document.querySelectorAll(".edit-address-btn");

const editAddressPanel = document.querySelector("#editAddressPanel");

const addressIdInput = document.getElementById("addressId");

const fullNameInput = document.querySelector(".full-name-input");
const mobileNumberInput = document.querySelector(".mobile-number-input");
const addressLineInput = document.querySelector(".address-line-input");
const emailInput = document.querySelector(".email-input");
const cityInput = document.querySelector(".city-input");
const stateInput = document.querySelector(".state-input");
const pincodeInput = document.querySelector(".pincode-input");

editAddressBtns.forEach((btn) => {

    btn.addEventListener("click", async (event) => {
        event.preventDefault();
        editAddressPanel.style.display = "block";
        addAddressPanel.style.display = "none";

        const addressId = btn.dataset.id;

        try {
            const response = await fetch(`/addressData?addressId=${addressId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json", // Adjust the content type based on your server's requirements
                    // Add any other headers if required
                },
            });

            if (response.ok) {
                const addressData = await response.json();

                // Populate the input fields with the received addressData

                addressIdInput.value = addressData._id;

                fullNameInput.value = addressData.name;
                mobileNumberInput.value = addressData.mobile;
                addressLineInput.value = addressData.addressLine;
                emailInput.value = addressData.email;
                cityInput.value = addressData.city;
                stateInput.value = addressData.state;
                pincodeInput.value = addressData.pincode;
            } else {
                console.log("Failed to fetch address data");
            }
        } catch (error) {
            console.log(error.message);
        }
    });
});

function scrollToForm() {
    // Delay for a certain duration (e.g., 500 milliseconds) before scrolling

    setTimeout(function () {
        // Calculate the offset of the target element
        const targetOffset = $("#editAddressPanel").offset().top;
   
        // Calculate the height of the window
        const windowHeight = $(window).height();
   
        // Calculate the final scroll position to scroll to the top of the target element
        const scrollPosition = targetOffset - windowHeight + $("#editAddressPanel").outerHeight();
     
        $("html, body").animate(
            {
                scrollTop: scrollPosition,
            },
            800
        ); // Adjust the animation speed as needed
    }, 300); // Adjust the delay duration as needed
}

function scrollToForm2() {
    // Delay for a certain duration (e.g., 500 milliseconds) before scrolling
    setTimeout(function () {
        // Calculate the offset of the target element
        const targetOffset = $("#addAddressPanel").offset().top;

        // Calculate the height of the window
        const windowHeight = $(window).height();

        // Calculate the final scroll position to scroll to the top of the target element
        const scrollPosition = targetOffset - windowHeight + $("#addAddressPanel").outerHeight();

        // Animate scrolling to the target element
        $("html, body").animate(
            {
                scrollTop: scrollPosition,
            },
            800
        ); // Adjust the animation speed as needed
    }, 300); // Adjust the delay duration as needed
}

const updateAddress = document.getElementById("updateAddress");

if (updateAddress) {
    updateAddress.addEventListener("submit", async function (event) {
        event.preventDefault();

        const form = event.target;
        const formData = new FormData(form);

        const addressId = document.getElementById("addressId").value;

        if ($(form).valid()) {
            try {
                const response = await fetch(`/updateAddress?addressId=${addressId}`, {
                    method: "POST",
                    body: JSON.stringify(Object.fromEntries(formData)),
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (response.ok) {
                    Swal.fire({
                        icon: "success",
                        title: "Successfully Updated address",
                        showConfirmButton: true,
                        confirmButtonText: "OK",
                        confirmButtonColor: "#4CAF50",
                    });
                    editAddressPanel.style.display = "none";
                    form.reset();
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Some error occured",
                        showConfirmButton: true,
                        confirmButtonText: "CANCEL",
                        confirmButtonColor: "#D22B2B",
                    });
                }
            } catch (error) {
                console.log("Error:", error.message);
            }
        }
    });
}


async function deleteAddress (addressId)  {

  const result = await Swal.fire({
       title: "Delete Address",
       text: "Do you want to delete this address?\nThis cannot be undone!",
       icon: "question",
       showCancelButton: true,
       confirmButtonColor: "#3085d6",
       cancelButtonColor: "#d33",
       confirmButtonText: "Yes, Delete",
       cancelButtonText: "DISMISS",
  });

  if (result.value) {
       try {
            const response = await fetch(`/deleteAddress?addressId=${addressId}`, {
                 method: "GET",
                 headers: {
                      "Content-Type": "application/json",
                 },
            });

            if (response.ok) {
                 Swal.fire({
                      icon: "success",
                      title: "Address has been deleted successfully",
                      showConfirmButton: true,
                      confirmButtonText: "OK",
                      confirmButtonColor: "#4CAF50",
                 });
                 document.getElementById("addressCard" + addressId).innerHTML = "";
            } else {
                 Swal.fire({
                      icon: "warning",
                      title: "Something error!!",
                      showConfirmButton: true,
                      confirmButtonText: "DISMISS",
                      confirmButtonColor: "#D22B2B",
                 });
            }
       } catch (error) {
            console.log(error.message);
       }
  }
};
