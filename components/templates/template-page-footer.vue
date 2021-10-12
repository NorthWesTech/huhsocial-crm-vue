<template>
  <footer>
    <div class="logo-wrapper">
      <img src="https://www.justgetvisible.com/static/templateimages/logo-black.png" />
    </div>
    <div class="address-wrapper">
      <h5>LANISTAR LIMITED</h5>
      <p>Sovereign House, 361 King St,</p>
      <p>Hammersmith, London W6 9NA</p>
    </div>
    <div class="contact-wrapper">
      <p><strong>owners@iamlanistar.com</strong></p>
      <p><strong>www.iamlanistar.com</strong></p>
    </div>
  </footer>
</template>

<script>
export default {
  name: "TemplatePageFooter",
  props: {
    pageNumber: {
      type: Number,
      default: 1
    }
  }
};
</script>

<style lang="scss" scoped>
// footer {
//   display: flex;
//   flex-direction: row;
//   align-items: flex-end;
//   padding: 20px 60px;
//   justify-self: flex-end;
//   border-top: 2px solid #00b2e2;
// }
// h5 {
//   margin-top: 0;
//   margin-bottom: 0;
// }
// p {
//   font-size: 13px;
//   margin-top: 0;
//   margin-bottom: 5px;
// }
// .logo-wrapper {
//   width: 45%;

//   img {
//     width: 200px;
//   }
// }
// .address-wrapper {
//   width: 30%;
// }
// .contact-wrapper {
//   width: 25%;
// }
</style>
