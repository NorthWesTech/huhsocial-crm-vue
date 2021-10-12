<template>
  <div class="contract-signed-wrapper">
    <div class="container">
      <div class="row" style="align-items: center">
        <div v-if="type == 'NDA'" class="col-12 contract-signed-text">
          <div class="header">
            <h1 class="title">Thank You For Signing Your NDA</h1>
            <h2 class="sub-title">Please lookout for your Zoom meeting invitation to learn all about us!</h2>
          </div>
          <p class="content">You Will Shortly Receive A copy Of Your Signed NDA Via Email</p>
          <img class="logo" src="/inf-admin/logo.svg" alt="logo" />
          <span>(You May Now Close This Tab)</span>
        </div>
        <div v-else class="col-12 col-md-7 contract-signed-text">
          <div v-if="templateType != 4" class="header">
            <h1 class="title">CONGRATULATIONS</h1>
            <h2 class="sub-title">Welcome To The Lanistar Family!</h2>
          </div>
          <p v-if="templateType == 4" class="content">
            You will receive a copy of the signed contract when all of the participants have signed.
          </p>
          <p v-else class="content">You Will Shortly Receive A copy Of Your Signed Contract Via Email</p>
          <img class="logo" src="/inf-admin/logo.svg" alt="logo" />
          <span>(You May Now Close This Tab)</span>
        </div>
        <div v-if="type != 'NDA'" class="col-md-5 cards-wrapper">
          <img src="/inf-admin/cards.svg" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["templateType", "type"]
};
</script>

<style lang="scss" scoped>
@import url("https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,600;1,400&display=swap");

.contract-signed-wrapper {
  font-family: "Poppins", sans-serif;
  background: url("/inf-admin/bg.svg") no-repeat;
  height: 100vh;
  background-size: cover;
  display: flex;
  align-items: center;
  position: fixed;
  left: 0;
  width: 100%;

  .contract-signed-text {
    height: 400px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-start;
    color: #fff;

    .title {
      font-size: 51px;
      font-weight: 300;
      line-height: 1;
      color: #000;
    }

    .sub-title {
      font-size: 23px;
      font-weight: bold;
      line-height: 1;
    }

    .content {
      font-size: 28px;
    }
  }
}

@media only screen and (max-width: 960px) {
  .cards-wrapper {
    display: none;
  }

  .contract-signed-text {
    align-items: center !important;

    .header {
      text-align: center;

      .title {
        font-size: 2em;
      }
      .sub-title {
        font-size: 1em;
      }
    }

    .content {
      font-size: 1.25em !important;
      padding: 0 16px;
      text-align: center;
    }
  }
}
</style>
