// 物业专有。发公告PUSH
<template>
  <div class="app-container">
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%"
    >
      <el-table-column width="180px" align="center" label="发布日期">
        <template slot-scope="{ row }">
          <span>{{ row.create_time | parseTime("{y}-{m}-{d} {h}:{i}") }}</span>
        </template>
      </el-table-column>

      <el-table-column width="" align="left" label="ID">
        <template slot-scope="{ row }">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>

      <el-table-column width="" align="left" label="标题">
        <template slot-scope="{ row }">
          <span>{{ row.title }}</span>
        </template>
      </el-table-column>

      <el-table-column width="100px" class-name="status-col" label="展示分类">
        <template slot-scope="{ row }">
          <span>{{ filterOption(row.service_id) }}</span>
        </template>
      </el-table-column>

      <!-- <el-table-column
        width="100px"
        class-name="status-col"
        label="重要程度"
        v-if="Kerrigan"
      >
        <template slot-scope="{ row }">
          <span>{{ row.top_flag }}</span>
        </template>
      </el-table-column> -->

      <!-- <el-table-column width="100px" class-name="status-col" label="置顶">
        <template slot-scope="{ row }">
          <el-switch
            v-model="row.top_flag"
            active-color="#13ce66"
            inactive-color="#ff4949"
            active-value="1"
            inactive-value="0"
            @change="handleChangeImp(row)"
          >
          </el-switch>
        </template>
      </el-table-column> -->

      <el-table-column class-name="status-col" label="状态" width="110">
        <template slot-scope="{ row }">
          <el-tag :type="row.status | statusFilter">
            {{ row.status == "1" ? "可用" : "禁用" }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column class-name="status-col" width="120px" label="链接">
        <template slot-scope="{ row }">
          <el-popconfirm :title="row.redirect_url" icon="el-icon-link">
            <template #reference>
              <el-button
                size="mini"
                @click="handleCopy(row.redirect_url, $event)"
                >查看链接</el-button
              >
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>

      <el-table-column
        label="操作"
        align="center"
        width="230"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{ row }">
          <el-button
            v-if="row.push_times == '0'"
            size="mini"
            type="success"
            :loading="row.update_loading"
            @click="push(row)"
          >
            发送推送
          </el-button>
          <el-button v-if="row.push_times != '0'" size="mini" type="info">
            已发送
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="pageIndex"
      :limit.sync="listQuery.page_size"
      @pagination="getList"
    />
  </div>
</template>

<script>
import { fetchList, sendPush } from "@/api/a_notice";
import { options, optionSuper, filterOption, Kerrigan } from "@/api/setting";
import Pagination from "@/components/Pagination";
import waves from "@/directive/waves"; // waves directive
import { parseTime } from "@/utils";
import wang from "@/components/wang";
import clip from "@/utils/clipboard"; // use clipboard directly

const contentTypeOptions = [
  { key: "0", display_name: "图文内容" },
  { key: "1", display_name: "外部链接" },
];

const defaultServiceId = "tab1";

export default {
  components: { Pagination, wang },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        1: "success",
        0: "info",
        2: "danger",
      };
      return statusMap[status];
    },
    switchFilter(status) {
      const impMap = {
        1: true,
        0: false,
      };
      return impMap[status];
    },
  },
  data() {
    return {
      createLabel: "发布新公告",
      Kerrigan,
      contentTypeOptions,
      serviceIdOptions: Kerrigan ? optionSuper : options,
      tableKey: 0,
      list: null,
      total: 200,
      listLoading: true,
      listQuery: {
        page_num: 0,
        page_size: 10,
      },
      temp: {
        loading: false,
        id: "",
        title: "",
        status: "0",
        contents_type: "0",
        top_flag: "0",
        contents: "",
        redirect_url: "",
        avatar: "",
        service_id: defaultServiceId,
      },
      dialogFormVisible: false,
      dialogStatus: "",
      textMap: {
        update: "Edit",
        create: "Create",
      },
      rules: {
        type: [
          { required: true, message: "type is required", trigger: "change" },
        ],
        title: [
          { required: true, message: "title is required", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.getList();
  },
  computed: {
    uploadedImages() {
      if (this.temp.avatar.length > 0) {
        return [{ name: "default", url: this.temp.avatar }];
      } else {
        return [];
      }
    },

    pageIndex: {
      get: function () {
        return this.listQuery.page_num + 1;
      },
      set: function (newValue) {
        this.listQuery.page_num = newValue - 1;
      },
    },
  },
  methods: {
    filterOption,
    async getList() {
      this.listLoading = true;
      const { data, total, page_size } = await fetchList(this.listQuery);
      const items = data;
      this.list = items.map((v) => {
        this.$set(v, "edit_loading", false); // https://vuejs.org/v2/guide/reactivity.html
        this.$set(v, "delete_loading", false);
        this.$set(v, "update_loading", false);
        this.$set(v, "top_flag2", Number(v.top_flag));
        return v;
      });
      this.listLoading = false;
      this.total = total;
    },
    async push(row) {
      row.delete_loading = true;
      const { data, code, message } = await sendPush(row.id);
      row.delete_loading = false;
      if (message === "success") {
        this.$notify({
          message: "发送成功",
          type: "success",
        });
        this.getList();
      } else {
        this.$message({
          message: "发送失败: " + message,
          type: "danger",
        });
      }
    },
  },
};
</script>

<style scoped>
.edit-input {
  padding-right: 100px;
}
.cancel-btn {
  position: absolute;
  right: 15px;
  top: 10px;
}
</style>
