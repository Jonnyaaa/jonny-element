<template>
  <div>
    <jo-button type="primary" loading>Loading</jo-button>
    <jo-button type="primary" loading-icon="circle-notch" loading
      >Loading</jo-button
    >
    <jo-button type="primary" loading>
      <template #loading>
        <jo-icon style="margin-right: 6px" icon="star" spin />
      </template>
      Loading
    </jo-button>
  </div>
</template>
