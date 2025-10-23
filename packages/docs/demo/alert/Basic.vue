<template>
  <h2>通过 slot 传入内容</h2>
  <div style="max-width: 600px">
    <jo-alert type="success">Success alert</jo-alert>
    <jo-alert type="info">Info alert</jo-alert>
    <jo-alert type="warning">Warning alert</jo-alert>
    <jo-alert type="danger">Error alert</jo-alert>
  </div>
  <h2>通过 prop 传入内容</h2>
  <div style="max-width: 600px">
    <jo-alert type="success" title="Success alert" />
    <jo-alert type="info" title="Info alert" />
    <jo-alert type="warning" title="Warning alert" />
    <jo-alert type="danger" title="Error alert" />
  </div>
</template>
