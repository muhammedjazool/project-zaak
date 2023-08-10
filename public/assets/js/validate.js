$(document).ready(function() {
    const delay = 1000;
  
    $("#categoryValidate").validate({
      rules: {
        name: {
          required: true,
          nameCheck: true,
        },
        categoryDescription: {
          required: true,
          CatDescCheck: true,
        },
        image: {
          required: true,
        },
      },
      messages: {
        name: {
          required: "Name is required",
          nameCheck: "Please enter a valid name",
        },
        categoryDescription: {
          required: "Description is required",
          CatDescCheck: "Please enter a valid description",
        },
        image: {
          required: "Image is required",
        },
      },
      errorClass: "error-message",
    });
  
    const catUpdatedMessage = $("#catUpdatedMessage");
    if (catUpdatedMessage.length) {
      setTimeout(function() {
        catUpdatedMessage.hide();
      }, delay);
    }
  
    const catNoUpdationMessage = $("#catNoUpdationMessage");
    if (catNoUpdationMessage.length) {
      setTimeout(function() {
        catNoUpdationMessage.hide();
      }, delay);
    }
  
    $.validator.addMethod("nameCheck", function(value) {
      return /^[a-zA-Z,.-_ ]{3,12}$/.test(value);
    });
  
    $.validator.addMethod("CatDescCheck", function(value) {
      return /^[a-zA-Z,.\-/ ]{3,100}$/.test(value);
    });
  
    $("#updateCategoryValidate").validate({
      rules: {
        name: {
          required: true,
          nameCheck: true,
        },
        categoryDescription: {
          required: true,
          CatDescCheck: true,
        },
      },
      messages: {
        name: {
          required: "Name is required",
          nameCheck: "Please enter a valid Name",
        },
        categoryDescription: {
          required: "Description is required",
          CatDescCheck: "Please enter a valid description",
        },
      },
      errorClass: "error-message",
    });
  });
  

  