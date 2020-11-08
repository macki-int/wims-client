<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />
        <q-toolbar-title>Wims App</q-toolbar-title>
        <div>Wims v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      content-class="bg-blue-8"
    >
      <q-list ref="onUpdateProductTypeList">
        <q-item-label header class="text-grey-1">KATEGORIA:</q-item-label>
        <ProductTypeMenuLink
          class="text-grey-1"
          v-for="productType in productTypes"
          :key="productType.id"
          v-bind="productType"
        />
      </q-list>
      <NewProductType />
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import ProductTypeMenuLink from "components/ProductTypeMenuLink.vue";
import NewProductType from "components/NewProductType.vue";
import axios from "axios";
// import vuex from "vuex";

export default {
  name: "MainLayout",
  components: {
    ProductTypeMenuLink,
    NewProductType
  },

  mounted: function() {
    this.getProductTypes();
    var vm = this;
    EventBus.$on("productTypesUpdated", function() {
      vm.getProductTypes();
      this.$refs.onUpdateProductTypeList.reload();
      console.log("reload!!!!!!!!!");
    });
  },

  data() {
    return {
      leftDrawerOpen: false,
      // [{"id":1,"name":"geotkanina"},{"id":2,"name":"geosiatka"}],
      productTypes: []
    };
  },

  methods: {
    getProductTypes: function() {
      const url = "http://localhost:8080/product-types";

      axios
        .get(url, {
          dataType: "json",
          headers: {}
        })
        .then(response => {
          //console.log("response: " + JSON.stringify(response.data));
          this.productTypes = response.data;
        })
        .catch(() => {
          this.$q.notify({
            color: "negative",
            position: "top",
            message: "Products types loading failed",
            icon: "report_problem"
          });
        });
      // console.log("refresh");
    },

    getProductsByProductType: function() {
      alert("Click Product Type: ");
    }
  }
};
</script>
