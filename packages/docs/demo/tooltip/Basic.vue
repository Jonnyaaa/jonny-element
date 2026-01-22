<template>
  <div class="tooltip-base-box">
    <div class="row center">
      <jo-tooltip
        class="box-item"
        content="Top Left prompts info"
        placement="top-start"
      >
        <jo-button>top-start</jo-button>
      </jo-tooltip>
      <jo-tooltip
        class="box-item"
        content="Top Center prompts info"
        placement="top"
      >
        <jo-button>top</jo-button>
      </jo-tooltip>
      <jo-tooltip
        class="box-item"
        content="Top Right prompts info"
        placement="top-end"
      >
        <jo-button>top-end</jo-button>
      </jo-tooltip>
    </div>
    <div class="row">
      <jo-tooltip
        class="box-item"
        content="Left Top prompts info"
        placement="left-start"
      >
        <jo-button>left-start</jo-button>
      </jo-tooltip>
      <jo-tooltip
        class="box-item"
        content="Right Top prompts info"
        placement="right-start"
      >
        <jo-button>right-start</jo-button>
      </jo-tooltip>
    </div>
    <div class="row">
      <jo-tooltip
        class="box-item"
        content="Left Center prompts info"
        placement="left"
      >
        <jo-button class="mt-3 mb-3">left</jo-button>
      </jo-tooltip>
      <jo-tooltip
        class="box-item"
        content="Right Center prompts info"
        placement="right"
      >
        <jo-button>right</jo-button>
      </jo-tooltip>
    </div>
    <div class="row">
      <jo-tooltip
        class="box-item"
        content="Left Bottom prompts info"
        placement="left-end"
      >
        <jo-button>left-end</jo-button>
      </jo-tooltip>
      <jo-tooltip
        class="box-item"
        content="Right Bottom prompts info"
        placement="right-end"
      >
        <jo-button>right-end</jo-button>
      </jo-tooltip>
    </div>
    <div class="row center">
      <jo-tooltip
        class="box-item"
        content="Bottom Left prompts info"
        placement="bottom-start"
      >
        <jo-button>bottom-start</jo-button>
      </jo-tooltip>
      <jo-tooltip
        class="box-item"
        content="Bottom Center prompts info"
        placement="bottom"
      >
        <jo-button>bottom</jo-button>
      </jo-tooltip>
      <jo-tooltip
        class="box-item"
        content="Bottom Right prompts info"
        placement="bottom-end"
      >
        <jo-button>bottom-end</jo-button>
      </jo-tooltip>
    </div>
  </div>
</template>

<style>
.tooltip-base-box {
  width: 600px;
}
.tooltip-base-box .row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.tooltip-base-box .center {
  justify-content: center;
}
.tooltip-base-box .box-item {
  width: 110px;
  margin-top: 10px;
}
</style>