// 


{/* <div class="field">
<label class="label">Add Category</label>
<div class="control">
  <div class="select">
    <% if (categories && categories.length > 0) { %>
    <select>
      <% categories.forEach(category => { %>
      <option><%= category.category %></option>
      <% }) %>
    </select>
    <% } else { %>
    <option>No Category Found</option>
    <% } %>
  </div>
</div>
</div> */}









{/* <div class="table-container">
<table class="size-table">
  <thead>
    <tr>
      <th>Size</th>
      <th>Quantity</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <label for="size-sm">Small</label>
        <!-- <input name="small" id="small"> -->
      </td>
      <td>
        <input type="number" name="sizes[sm]" id="size-sm" min="0" value="0">
      </td>
    </tr>
    <tr>
      <td>
        <label for="size-m">Medium</label>
        <!-- <input name="medium" id="medium"> -->
      </td>
      <td>
        <input type="number" name="sizes[m]" id="size-m" min="0" value="0">
      </td>
    </tr>
    <tr>
      <td>
        <label for="size-L">Large</label>
        <!-- <input name="large" id="large"> -->
      </td>
      <td>
        <input type="number" name="sizes[L]" id="size-L" min="0" value="0">
      </td>
    </tr>

    <tr>
      <td>
        <label for="size-XL">X-Large</label>
        <!-- <input name="X-large" id="X-large"> -->
      </td>
      <td>
        <input type="number" name="sizes[XL]" id="size-XL" min="0" value="0">
      </td>
    </tr>
    <!-- Add other size inputs for 'l', 'xl', 'xxl', etc. -->
  </tbody>
</table>
</div> */}





// Set default sizes for each product
      // const defaultSizes = [
        // { size: "sm", quantity: 0 },
        // { size: "m", quantity: 0 },
        // { size: "l", quantity: 0 },
        // { size: "Xl", quantity: 0 },
        // Add other size objects with their respective quantities
      // ];
  
      // const productsWithSizes = productData.map((product) => ({
      //   ...product,
      //   sizes: [...defaultSizes],
      // }));




    //   <td>
    //   <% if (row.stock.length > 0) { %>
    //     <% row.stock.forEach(stockItem => { %>
    //       <p>
    //         <strong>Small:</strong> <%= stockItem.small %><br>
    //         <strong>Medium:</strong> <%= stockItem.medium %><br>
    //         <strong>Large:</strong> <%= stockItem.large %><br>
    //         <strong>XLarge:</strong> <%= stockItem.xlarge %>
    //       </p>
    //     <% }) %>
    //   <% } else { %>
    //     <p>No sizes available</p>
    //   <% } %>
    // </td>








    <div class="control">
                <% if (categories && categories.length> 0) { %>
                  <select style="width:180px;" name="category" class="category-select" required>
                    <% categories.forEach(category=> { %>
                      <option value="<%= category._id %>">
                        <%= category.category %>
                      </option>
                      <% }) %>
                  </select>
                  <% } else { %>
                    <option>No Category Found</option>
                    <% } %>
              </div>