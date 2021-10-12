<template>
  <v-layout v-if="influencerInfo" column>
    <v-snackbar :value="successMessage" :timeout="5000" color="success">
      {{ successMessage }}
      <v-btn color="white" text @click="successMessage = null"> Close </v-btn>
    </v-snackbar>

    <v-sheet v-if="warningMessage">
      <v-alert type="warning">
        {{ warningMessage }}
      </v-alert>
    </v-sheet>
    <div class="mb-3 d-flex justify-end">
      <!-- <a :href="referenceLink" target="blank" class="mr-2">Referral Link <i class="mdi mdi-open-in-new"></i></a>
      <a :href="profileLink" target="blank" class="mr-2">Profile Link <i class="mdi mdi-open-in-new"></i></a> -->
      <v-btn small text :href="referenceLink"> Referral Link <i class="mdi mdi-open-in-new"></i> </v-btn>
      <v-btn small text :href="profileLink"> Profile Link <i class="mdi mdi-open-in-new"></i> </v-btn>
      <v-btn
        v-if="!isReadonly"
        color="primary"
        small
        class="mr-2"
        :to="{
          name: 'influencers-edit-id',
          params: { id: influencerInfo.influencerId }
        }"
        data-cy="influencer-edit"
      >
        <v-icon left> mdi-pencil </v-icon>
        Edit
      </v-btn>
      <v-dialog v-model="deleteDialog" persistent max-width="290">
        <template #activator="{ on }">
          <v-btn color="red" dark small data-cy="influencer-delete" v-on="on">
            <v-icon> mdi-delete-outline </v-icon>
          </v-btn>
        </template>
        <v-card>
          <v-card-title class="headline">Delete Influencer? </v-card-title>
          <v-card-text>Are you sure to delete this influencer </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="gray lighten-1" text @click="deleteDialog = false">Cancel </v-btn>
            <v-btn color="green darken-1" text data-cy="confirm-delete" @click="deleteInfluencer">Delete </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
    <profile-card
      v-if="influencerInfo"
      :influencer-info="influencerInfo"
      :referred-by-full-name="referrerInfFullName"
      :total-referred-value="totalValue"
    />

    <v-btn-toggle v-model="selectedTab" color="primary" class="mt-3" group mandatory small>
      <v-btn value="contract2">
        <v-badge
          v-if="influencerNewContractTemplatesInfo.length"
          color="primary"
          :content="influencerNewContractTemplatesInfo.length"
        >
          Contract (new)
        </v-badge>
        <span v-else>Contract (New)</span>
      </v-btn>
      <v-btn value="contract">
        <v-badge
          v-if="influencerContractTemplatesInfo.length"
          color="primary"
          :content="influencerContractTemplatesInfo.length"
        >
          Contract
        </v-badge>
        <span v-else>Contract</span>
      </v-btn>

      <v-btn value="nda" class="tab-item">
        <v-badge v-if="influencerNDATemplatesInfo.length" color="primary" :content="influencerNDATemplatesInfo.length">
          NDA
        </v-badge>
        <span v-else> NDA </span>
      </v-btn>

      <v-btn value="term-sheet" class="tab-item">
        <v-badge
          v-if="influencerTermSheetTemplatesInfo.length"
          color="primary"
          :content="influencerTermSheetTemplatesInfo.length"
        >
          Term Sheet
        </v-badge>
        <span v-else> Term Sheet </span>
      </v-btn>

      <v-btn value="multiple" class="tab-item">
        <v-badge v-if="multipleSignedCount" color="primary" :content="multipleSignedCount"> Multiple Signed </v-badge>
        <span v-else> Multiple Signed </span>
      </v-btn>

      <v-btn value="void" class="tab-item">
        <v-badge v-if="voidContractCount" color="primary" :content="voidContractCount"> Void Contracts </v-badge>
        <span v-else> Void Contracts </span>
      </v-btn>

      <v-btn value="referral" class="tab-item">
        <v-badge
          v-if="influencerTermSheetTemplatesInfo.length"
          color="primary"
          :content="influencerTermSheetTemplatesInfo.length"
        >
          Referral Links
        </v-badge>
        <span v-else> Referral Links </span>
      </v-btn>

      <v-btn value="referred" class="tab-item">
        <v-badge v-if="referredInfluencers.length" color="primary" :content="referredInfluencersTotalCount">
          Referred Influencers
        </v-badge>
        <span v-else> Referred Influencers </span>
      </v-btn>
      <v-btn value="files" class="tab-item">
        <v-badge v-if="files.length" color="primary" :content="files.length"> Files </v-badge>
        <span v-else> Files </span>
      </v-btn>
      <!-- <v-btn value="notes" class="tab-item">
        <v-badge v-if="commentsCount" color="primary" :content="commentsCount">
          Notes
        </v-badge>
        <span v-else>
          Notes
        </span>
      </v-btn> -->
    </v-btn-toggle>

    <template v-if="selectedTab === 'contract'">
      <v-card class="mt-3 elevation-2">
        <v-card-title>
          <v-col cols="12" md="6" class="d-flex">
            <h3>Contract List</h3>
            <label class="ml-2">
              <span v-if="influencerContractTemplatesInfo.length > 0" style="font-size: 14px; color: #666"
                >Showing
                <strong style="color: #1976d2">{{ influencerContractTemplatesInfo.length }}</strong>
                records</span
              >
            </label>
          </v-col>

          <v-col cols="12" md="6" class="text-xs-right">
            <v-btn
              outlined
              depressed
              color="green"
              :to="{
                name: 'manage-templates-influencers-type-influencerId',
                params: { type: 1, influencerId: id }
              }"
            >
              New Contract
            </v-btn>
          </v-col>
        </v-card-title>
        <v-card-text>
          <v-row>
            <documents-list-old
              :format-date-time="formatDateTime"
              :send-mail-for-influencer-templates-review="sendMailForInfluencerTemplatesReview"
              :delete-contract-influencer-templates="deleteContractInfluencerTemplates"
              :download-contract="downloadContract"
              :deactivate-influencer-template="deactivateInfluencerTemplate"
              :all-documents="influencerContractTemplatesInfo"
            />
          </v-row>
        </v-card-text>
      </v-card>
    </template>
    <template v-if="selectedTab === 'nda'">
      <v-card class="mt-3 elevation-2">
        <v-card-title>
          <v-col cols="12" md="6" class="d-flex">
            <h3>NDA</h3>
            <label class="ml-2">
              <span v-if="influencerNDATemplatesInfo.length > 0" style="font-size: 14px; color: #666"
                >Showing
                <strong style="color: #1976d2">{{ influencerNDATemplatesInfo.length }}</strong>
                records</span
              >
            </label>
          </v-col>

          <v-col cols="12" md="6" class="text-xs-right">
            <v-btn outlined depressed color="green" :loading="loadingNDA" @click="createNDA">
              New NDA
            </v-btn>
          </v-col>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col v-if="!influencerNDATemplatesInfo.length" cols="12">
              <v-alert color="warning" class="pa-3" dense text> No NDA has created </v-alert>
            </v-col>

            <v-col v-if="influencerNDATemplatesInfo.length" cols="12">
              <v-simple-table v-if="!loading && influencerNDATemplatesInfo" :dense="$vuetify.breakpoint.smAndDown">
                <template #default>
                  <thead>
                    <tr>
                      <th>Template Name</th>
                      <th>NDA Status</th>
                      <th v-if="!isReadonly">Actions</th>
                      <th v-if="!isReadonly">Edit</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="item in influencerNDATemplatesInfo"
                      :key="item.influencer_templates_id"
                      :class="!item.is_active ? 'disabled-contract-row' : ''"
                    >
                      <td>
                        {{ item.influencer_template_name }}
                        <span v-if="item.cc_email" style="display: block; font-size: 12px"
                          >CC: {{ item.cc_email }}</span
                        >
                      </td>
                      <td>
                        <v-chip v-if="item.status_flag == 0" small color="red" text-color="white">Not Sent </v-chip>
                        <v-chip v-if="item.status_flag == 1" small color="orange" text-color="white"
                          >Sent -
                          {{ formatDateTime(item.invitation_sent_date) }}
                        </v-chip>
                        <v-chip v-if="item.status_flag == 2" small color="green" text-color="white"
                          >Signed -
                          {{ formatDateTime(item.influencer_updated_date) }}
                        </v-chip>
                      </td>
                      <td v-if="!isReadonly">
                        <v-btn
                          v-if="item.is_active && item.status_flag == 0"
                          small
                          depressed
                          color="primary"
                          :loading="loading"
                          @click="sendMailForInfluencerTemplatesReview(item.influencer_templates_id, 2, $event)"
                        >
                          Send NDA
                          <i class="spinner fa fa-circle-o-notch fa-spin"></i>
                        </v-btn>

                        <v-btn
                          v-if="item.is_active && item.status_flag == 1"
                          small
                          depressed
                          color="primary"
                          :loading="loading"
                          @click="sendMailForInfluencerTemplatesReview(item.influencer_templates_id, 2, $event)"
                        >
                          Re-Send NDA
                          <i class="spinner fa fa-circle-o-notch fa-spin"></i>
                        </v-btn>

                        <v-btn
                          small
                          depressed
                          color="primary"
                          :loading="loading"
                          :to="{
                            name: 'influencers-profile-view-influcertemplateid',
                            params: {
                              influcertemplateid: item.influencer_templates_id
                            }
                          }"
                          target="_blank"
                        >
                          View NDA
                        </v-btn>
                      </td>
                      <td v-if="!isReadonly">
                        <v-btn
                          v-if="item.is_active && item.status_flag == 0"
                          icon
                          link
                          :to="{
                            name: 'manage-templates-influencers-edit-influencerId',
                            params: {
                              influencerId: item.influencer_templates_id
                            }
                          }"
                        >
                          <v-icon>fa-pencil-square-o</v-icon>
                        </v-btn>

                        <v-btn
                          v-if="item.is_active && item.status_flag == 0"
                          icon
                          @click="deleteNDAInfluencerTemplates(item.influencer_templates_id)"
                        >
                          <v-icon>fa-trash-o</v-icon>
                        </v-btn>

                        <v-btn
                          v-if="item.status_flag == 2"
                          icon
                          link
                          :href="`${msLandingUrl}/templates/downloadInfluencerTemplate/${item.influencer_templates_id}`"
                        >
                          <v-icon>fa-download</v-icon>
                        </v-btn>

                        <v-btn
                          v-if="item.is_active"
                          icon
                          @click="deactivateInfluencerTemplate(item.influencer_templates_id, item.template_type)"
                        >
                          <v-icon>fa-stop-circle-o</v-icon>
                        </v-btn>
                      </td>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </template>
    <template v-if="selectedTab === 'term-sheet'">
      <v-card class="mt-3 elevation-2">
        <v-card-title>
          <v-col cols="12" md="6" class="d-flex">
            <h3>Term Sheet</h3>
            <label class="ml-2">
              <span v-if="influencerTermSheetTemplatesInfo.length > 0" style="font-size: 14px; color: #666"
                >Showing
                <strong style="color: #1976d2">{{ influencerTermSheetTemplatesInfo.length }}</strong>
                records</span
              >
            </label>
          </v-col>

          <v-col cols="12" md="6" class="text-xs-right">
            <v-btn outlined depressed color="green" :loading="loadingTermSheet" @click="createTermSheet">
              New Term Sheet
            </v-btn>
          </v-col>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col v-if="!influencerTermSheetTemplatesInfo.length" cols="12">
              <v-alert color="warning" class="pa-3" dense text> No Term Sheet has created </v-alert>
            </v-col>

            <v-col v-if="influencerTermSheetTemplatesInfo.length" cols="12">
              <v-simple-table
                v-if="!loading && influencerTermSheetTemplatesInfo"
                :loading="loadingTermSheet"
                :dense="$vuetify.breakpoint.smAndDown"
              >
                <template #default>
                  <thead>
                    <tr>
                      <th>Template Name</th>
                      <th>Term Sheet Status</th>
                      <th v-if="!isReadonly">Actions</th>
                      <th v-if="!isReadonly">Edit</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="item in influencerTermSheetTemplatesInfo"
                      :key="item.influencer_templates_id"
                      :class="!item.is_active ? 'disabled-contract-row' : ''"
                    >
                      <td>
                        {{ item.influencer_template_name }}
                        <span v-if="item.cc_email" style="display: block; font-size: 12px"
                          >CC: {{ item.cc_email }}</span
                        >
                      </td>
                      <td>
                        <v-chip v-if="item.status_flag == 0" small color="red" text-color="white">Not Sent </v-chip>
                        <v-chip v-if="item.status_flag == 1" small color="orange" text-color="white"
                          >Sent -
                          {{ formatDateTime(item.invitation_sent_date) }}
                        </v-chip>
                        <v-chip v-if="item.status_flag == 2" small color="green" text-color="white"
                          >Signed -
                          {{ formatDateTime(item.influencer_updated_date) }}
                        </v-chip>
                      </td>
                      <td v-if="!isReadonly">
                        <v-btn
                          v-if="item.is_active && item.status_flag == 0"
                          small
                          depressed
                          color="primary"
                          :loading="loadingPDFSending"
                          @click="sendTermSheetPdfToInfluencer(item.influencer_templates_id, 3, $event)"
                        >
                          Send Term Sheet
                          <i class="spinner fa fa-circle-o-notch fa-spin"></i>
                        </v-btn>

                        <v-btn
                          v-if="item.is_active && item.status_flag == 1"
                          small
                          depressed
                          color="primary"
                          :loading="loadingPDFSending"
                          @click="sendTermSheetPdfToInfluencer(item.influencer_templates_id, 3, $event)"
                        >
                          Re-Send Term Sheet
                          <i class="spinner fa fa-circle-o-notch fa-spin"></i>
                        </v-btn>

                        <v-btn
                          small
                          depressed
                          color="primary"
                          :loading="loading"
                          :to="{
                            name: 'influencers-profile-view-influcertemplateid',
                            params: {
                              influcertemplateid: item.influencer_templates_id
                            }
                          }"
                          target="_blank"
                        >
                          View Term Sheet
                        </v-btn>
                      </td>
                      <td v-if="!isReadonly">
                        <v-btn
                          v-if="item.is_active && item.status_flag == 0"
                          icon
                          link
                          :to="{
                            name: 'manage-templates-influencers-edit-influencerId',
                            params: {
                              influencerId: item.influencer_templates_id
                            }
                          }"
                        >
                          <v-icon>fa-pencil-square-o</v-icon>
                        </v-btn>

                        <v-btn
                          v-if="item.is_active && item.status_flag == 0"
                          icon
                          @click="deleteTermSheetInfluencerTemplates(item.influencer_templates_id)"
                        >
                          <v-icon>fa-trash-o</v-icon>
                        </v-btn>

                        <v-btn
                          v-if="item.status_flag == 2"
                          icon
                          link
                          :href="`${msLandingUrl}/templates/downloadInfluencerTemplate/${item.influencer_templates_id}`"
                        >
                          <v-icon>fa-download</v-icon>
                        </v-btn>

                        <v-btn
                          v-if="item.is_active"
                          icon
                          @click="deactivateInfluencerTemplate(item.influencer_templates_id, item.template_type)"
                        >
                          <v-icon>fa-stop-circle-o</v-icon>
                        </v-btn>
                      </td>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </template>
    <template v-if="selectedTab === 'contract2'">
      <v-card class="mt-3 elevation-2">
        <v-card-title>
          <v-col cols="12" md="6" class="d-flex">
            <h3>Contract (New) List</h3>
            <label class="ml-2">
              <span v-if="influencerContractTemplatesInfo.length > 0" style="font-size: 14px; color: #666"
                >Showing
                <strong style="color: #1976d2">{{ influencerContractTemplatesInfo.length }}</strong>
                records</span
              >
            </label>
          </v-col>

          <v-col cols="12" md="6" class="text-xs-right">
            <select-template-dialog
              button-label="New Contract"
              :influencer-id="id"
              :template-type="1"
              @onSelect="handleCreateContractSelect"
            />
          </v-col>
        </v-card-title>
        <v-card-text>
          <v-row>
            <documents-list
              :loading="loading"
              :is-readonly="isReadonly"
              :template-type="1"
              :all-documents="allDocuments"
              @documentSent="handleDocumentSent"
              @documentDeleted="loaddAllDocuments"
              @documentStopped="loaddAllDocuments"
              @error="showError"
            />
          </v-row>
        </v-card-text>
      </v-card>
    </template>
    <MultipleSignedList
      v-show="selectedTab === 'multiple'"
      ref="multipleSignedList"
      v-model="multipleSignedCount"
      :influencer="influencerInfo.influencerId"
      :is-readonly="isReadonly"
    />
    <VoidContractList
      v-show="selectedTab === 'void'"
      ref="voidContractList"
      v-model="voidContractCount"
      :influencer-id="influencerInfo.influencerId"
      :is-readonly="isReadonly"
    />
    <template v-if="selectedTab === 'referral'">
      <v-card class="mt-3 elevation-2">
        <v-card-title>
          <v-col cols="12" md="6" class="d-flex">
            <h3>Referral Links</h3>
            <label class="ml-2">
              <span v-if="influencerTermSheetTemplatesInfo.length > 0" style="font-size: 14px; color: #666"
                >Showing
                <strong style="color: #1976d2">{{ influencerTermSheetTemplatesInfo.length }}</strong>
                records</span
              >
            </label>
          </v-col>

          <v-col cols="12" md="6" class="text-xs-right">
            <v-btn outlined depressed color="green" @click="sendMailForReferralLinks($event)">
              Send Links
              <i class="spinner fa fa-circle-o-notch fa-spin"></i>
            </v-btn>
          </v-col>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-simple-table
                v-if="!loading && influencerTermSheetTemplatesInfo"
                :dense="$vuetify.breakpoint.smAndDown"
              >
                <template #default>
                  <thead>
                    <tr>
                      <th>Referal Link Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <span v-if="influencerInfo.termsheet_date">Sent</span>
                        <span v-if="!influencerInfo.termsheet_date">Not Sent</span>
                      </td>
                      <td>
                        <span v-if="influencerInfo.termsheet_date">{{
                          formatDateTime(influencerInfo.termsheet_date)
                        }}</span>
                        <span v-if="!influencerInfo.termsheet_date">N/A</span>
                      </td>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </template>
    <template v-if="selectedTab === 'referred'">
      <v-card class="mt-3 elevation-2">
        <v-card-title>
          <v-col cols="12" md="6" class="d-flex">
            <h3>Referred Influencers</h3>
            <label class="ml-2">
              <span v-if="referredInfluencers.length > 0" style="font-size: 14px; color: #666"
                >Showing
                <strong style="color: #1976d2">{{ referredInfluencers.length }}</strong>
                records</span
              >
            </label>
          </v-col>

          <v-col cols="12" md="6" class="text-xs-right d-flex">
            <v-autocomplete
              v-model="selectedInfluencer"
              outlined
              dense
              :items="foundItems"
              :loading="isSearching"
              :search-input.sync="searchQuery"
              hide-no-data
              hide-selected
              clearable
              item-text="label"
              item-value="influencerId"
              placeholder="Influencer name, email or phone number"
              prepend-icon="mdi-database-search"
              return-object
            >
            </v-autocomplete>
            <v-btn v-if="selectedInfluencer" class="ml-2" color="primary" @click.prevent="addReferral">
              Add {{ selectedInfluencer.firstName }} {{ selectedInfluencer.lastName }} as referral
            </v-btn>
          </v-col>
        </v-card-title>
        <v-card-text>
          <InfluencerTable
            :headers="referredInfluencersHeaders"
            :items="referredInfluencers"
            :loading="loading"
            :total-count="referredInfluencersTotalCount"
            :total-page-num="referredInfluencersTotalPageNum"
            :from="'referred'"
            @onChangeOptions="onChangeOptions"
          />
        </v-card-text>
      </v-card>
    </template>
    <FilesForm
      v-show="selectedTab === 'files'"
      ref="filesForm"
      v-model="files"
      :influencer-id="influencerInfo.influencerId"
    />
    <div>
      <v-card class="mt-3 elevation-2">
        <v-card-title>
          <v-col cols="12" md="6" class="d-flex">
            <h3>ORM</h3>
          </v-col>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-btn-toggle v-model="selectedOrmTab" color="primary" class="mt-3" group mandatory small>
                <v-btn value="deliveryAddress">
                  <span>Delivery Address</span>
                </v-btn>
                <v-btn value="contentBank" class="tab-item">
                  <span>Content Bank</span>
                </v-btn>
                <v-btn value="contentTracking" class="tab-item">
                  <span>Content Tracking</span>
                </v-btn>
                <v-btn value="contentHistory" class="tab-item">
                  <span>Content History</span>
                </v-btn>
              </v-btn-toggle>
              <template v-if="selectedOrmTab === 'deliveryAddress'">
                <v-card class="mt-3 elevation-2">
                  <v-card-title>
                    <v-col cols="12" md="6" class="d-flex">
                      <i class="mdi mdi-map-marker mr-1"></i>
                      <h3>Delivery Address</h3>
                    </v-col>
                  </v-card-title>
                  <v-card-text>
                    <v-form @submit.prevent="addressLineSubmit">
                      <v-row>
                        <v-col cols="4">
                          <v-text-field
                            v-model="influencerInfo.address1"
                            outlined
                            dense
                            label="Address line 1"
                          ></v-text-field>
                        </v-col>
                        <v-col cols="4">
                          <v-text-field
                            v-model="influencerInfo.address2"
                            outlined
                            dense
                            label="Address line 2"
                          ></v-text-field>
                        </v-col>
                        <v-col cols="4">
                          <v-text-field
                            v-model="influencerInfo.address3"
                            outlined
                            dense
                            label="Address line 3"
                          ></v-text-field>
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col cols="4">
                          <v-text-field v-model="influencerInfo.city" outlined dense label="City/State"></v-text-field>
                        </v-col>
                        <v-col cols="4">
                          <v-select
                            v-model="influencerInfo.countrycode"
                            outlined
                            dense
                            :items="countries"
                            item-text="label"
                            item-value="value"
                            auto-select-first
                            label="Country"
                          ></v-select>
                        </v-col>
                        <v-col cols="4">
                          <v-text-field
                            v-model="influencerInfo.postcode"
                            outlined
                            dense
                            label="Zip/Postcode"
                          ></v-text-field>
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col cols="4">
                          <v-text-field
                            v-model="influencerInfo.phoneNumber"
                            outlined
                            dense
                            label="Phone number"
                          ></v-text-field>
                        </v-col>
                        <v-col cols="4">
                          <v-btn type="submit" color="primary" :disabled="loading" :loading="loading"> Save </v-btn>
                        </v-col>
                      </v-row>
                    </v-form>
                  </v-card-text>
                </v-card>
              </template>
              <template v-if="selectedOrmTab === 'contentHistory'">
                <PostingHistory :influencer-id="influencerInfo.influencerId" />
              </template>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </div>
    <!-- <Comments v-model="commentsCount" :influencer="influencerInfo.influencerId" v-show="selectedTab === 'notes'" /> -->
  </v-layout>
</template>

<script>
import AuthHelper from "@/utils/auth-helper";
import InfluencerTable from "@/components/InfluencerTable";
import config from "@/config";
import countries from "@/countries";
import parseApiError from "@/utils/parse-api-error";
import { copyToClipboard } from "@/utils/copy-text-clipboard";
import ProfileCard from "@/components/influencer/ProfileCard.vue";
import FilesForm from "@/components/influencer/FilesForm.vue";
import MultipleSignedList from "@/components/influencer/contracts/MultipleSignedList.vue";
import VoidContractList from "@/components/influencer/contracts/VoidContractList.vue";
import PostingHistory from "@/components/influencer/PostingHistory.vue";
import DocumentsList from "@/components/influencer/profile/documents-list.vue";
import DocumentsListOld from "@/components/influencer/profile/documents-list-old.vue";
import RouteHelper from "@/utils/route-helper";
import SelectTemplateDialog from "@/components/templates/select-template-dialog";
import globalMixins from "@/mixins/globals";
import goTo from "vuetify/es5/services/goto";

let timer = null;

const formatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  notation: "standard",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});

export default {
  components: {
    InfluencerTable,
    ProfileCard,
    FilesForm,
    MultipleSignedList,
    VoidContractList,
    PostingHistory,
    SelectTemplateDialog,
    DocumentsList,
    DocumentsListOld
  },
  mixins: [globalMixins],
  data() {
    return {
      loading: false,
      isSearching: false,
      loadingTermSheet: false,
      loadingNDA: false,
      msLandingUrl: config.msLandingUrl,
      searchResults: [],
      searchQuery: null,
      selectedInfluencer: null,
      warningMessage: null,
      successMessage: null,
      verifyDialog: false,
      deleteDialog: false,
      id: null,
      loadingPDFSending: false,
      influencerInfo: null,
      countries: countries.countriesList,
      assignedUserFullName: null,
      referrerInfFullName: null,
      referredInfluencers: [],
      referredInfluencersTotalCount: 0,
      referredInfluencersPaginateNum: 0,
      referredInfluencersTotalPageNum: 0,
      influencerContractTemplatesInfo: [],
      influencerNewContractTemplatesInfo: [],
      influencerNDATemplatesInfo: [],
      influencerTermSheetTemplatesInfo: [],
      influencerMultipleSignedContractTemplatesInfo: [],
      selectedTab: {},
      selectedOrmTab: "deliveryAddress",
      files: [],
      commentsCount: 0,
      multipleSignedCount: 0,
      voidContractCount: 0,
      referredInfluencersHeaders: [
        {
          text: "Influencer Name",
          value: "firstName",
          sortable: false
        },
        {
          text: "Created Date",
          value: "createdAt",
          align: "center",
          sortable: true
        },
        {
          text: "Assigned To",
          value: "assignedto",
          sortable: false,
          align: "center",
          width: 250
        },
        {
          text: "Contract Status",
          value: "contractStatus",
          sortable: false,
          align: "center",
          width: 250
        },
        {
          text: "Actions",
          value: "action",
          align: "center",
          sortable: true
        }
      ],
      allDocuments: []
    };
  },
  computed: {
    isReadonly() {
      return AuthHelper.isReadonly(this.influencerInfo.assignedto, this.$auth.user);
    },
    assignedToCases() {
      return config.assignedToCases.concat(this.$store.state.usersToBeAssigned);
    },
    emailErrors() {
      const errors = [];
      if (!this.$v.emailAddress.$dirty) return errors;
      !this.$v.emailAddress.email && errors.push("Must be a valid e-mail");
      !this.$v.emailAddress.required && errors.push("Phone number is required");
      return errors;
    },
    influencerFullName() {
      if (!this.influencerInfo) {
        return null;
      }
      return `${this.influencerInfo.firstName} ${this.influencerInfo.lastName}`;
    },
    referenceLink() {
      if (!this.influencerInfo) {
        return null;
      }
      return `https://inf.iamlanistar.com/register?ref=${this.influencerInfo.referralCode}`;
    },
    profileLink() {
      if (!this.influencerInfo) {
        return null;
      }
      return `https://inf.iamlanistar.com/profile/${this.influencerInfo.token}`;
      // return `http://localhost:3000/profile/${this.influencerInfo.token}`
    },
    foundItems() {
      return this.searchResults.map(item => {
        return {
          label: `${item.firstName} ${item.lastName} < ${item.email} > < ${item.phoneNumber} >`,
          ...item
        };
      });
    },
    statusLabel() {
      const result = config.contractStatuses.find(item => {
        return item.value == this.influencerInfo.contractStatus;
      });
      if (result) {
        return result.label;
      }
      return "";
    },
    totalValue() {
      if (!this.referredInfluencers || !this.referredInfluencers.length) {
        return "";
      }

      // const total = this.referredInfluencers.reduce((sum, user) => {
      //   if (!user || !user.referralValue || user.notAccepted === true) {
      //     return sum;
      //   }
      //   const val = Number(user.referralValue);
      //   if (!val || Number.isNaN(val)) {
      //     return sum;
      //   }
      //   return sum + val;
      // }, 0);
      // return formatter.format(total);

      return this.referredInfluencersTotalCount.toString();
    },
    contractValue() {
      const contractValue = config.contractValues.find(f => f.value == this.influencerInfo.contractValue);
      return contractValue ? contractValue : formatter.format(this.influencerInfo.contractValue);
    },
    referralValueFormatted() {
      return formatter.format(this.influencerInfo.referralValue);
    }
    // files() {
    //   //if (!this.$refs.filesForm) return [];
    //   return this.$refs.filesForm.files;
    // }
  },
  watch: {
    searchQuery(val) {
      if (!val || val.length < 3) {
        return;
      }
      // Items have already been loaded
      // if (this.foundItems.length > 0) return
      clearTimeout(timer);
      timer = setTimeout(async () => {
        // Items have already been requested
        if (this.isSearching) return;

        this.isSearching = true;

        try {
          const data = {
            searchClue: val.toLowerCase(),
            autoComplete: true,
            role: this.$auth.user.role,
            user_id: this.$auth.user.id
          };
          const result = await this.$influencerService.list(data);
          if (result) {
            this.searchResults = result.list;
          }
        } catch (error) {
          console.log(error);
        } finally {
          this.isSearching = false;
        }
      }, 500);
    }
  },
  async mounted() {
    const { id } = this.$route.params;
    if (!id) {
      this.warningMessage = "Influencer id is missing";
      return;
    }
    this.id = id;
    this.getInfluencerInfo();
    this.getContractInfluncertemplate();
    this.getNDAInfluncertemplate();
    this.getTermSheetInfluncertemplate();
    this.getMultipleSignedContractInfluncertemplate();
    this.loaddAllDocuments();
    const params = RouteHelper.getHashParams(this.$route);
    if (params.tab) {
      this.selectedTab = params.tab;
    }
  },
  methods: {
    onChangeOptions(options) {
      this.referredInfluencersPaginateNum = options.page;
      this.getReferredInfluencers();
    },
    async getInfluencerInfo() {
      this.loading = true;
      try {
        const result = await this.$influencerService.info(this.id);
        if (result) {
          this.influencerInfo = result.profileInfo;
          this.assignedUserFullName = await this.getAssignedUser(this.influencerInfo.assignedto);
          if (result.profileInfo.referredBy) {
            this.referrerInfFullName = await this.getReferrerInfFullname(this.influencerInfo.referredBy);
          }
          // console.log("multipleSignedList", this.$refs.multipleSignedList);
          this.$refs.multipleSignedList.getTemplates();

          await this.getReferredInfluencers();
        }
      } catch (error) {
        this.warningMessage = parseApiError(error);
      }
      this.loading = false;
    },
    async getAssignedUser(userId) {
      if (!userId) {
        return "Not assigned yet";
      }
      const result = await this.$userService.info(userId);
      if (result) {
        return result.fullname;
      } else {
        return "-";
      }
    },
    async getReferrerInfFullname(referrerInfId) {
      const result = await this.$influencerService.info(referrerInfId);
      if (result) {
        return `${result.profileInfo.firstName} ${result.profileInfo.lastName}`;
      } else {
        return "-";
      }
    },
    async getReferredInfluencers() {
      try {
        const data = {
          paginateNum: this.referredInfluencersPaginateNum,
          referredBy: this.influencerInfo.influencerId,
          role: this.$auth.user.role,
          user_id: this.$auth.user.id,
          // autoComplete: true,
          from: "referred"
        };
        const result = await this.$influencerService.list(data);
        if (result) {
          this.referredInfluencers = result.list;
          this.referredInfluencersTotalCount = result.count;
          this.referredInfluencersTotalPageNum = Math.floor(result.count / 20) + 1;
        }
      } catch (error) {
        console.log(error.response);
      }
    },
    async addReferral() {
      if (!this.selectedInfluencer) {
        return;
      }
      this.loading = true;
      try {
        const data = {
          influencerId: this.id,
          referralId: this.selectedInfluencer.id
        };
        const result = await this.$influencerService.addReferral(data);
        if (result) {
          if (result.code !== 6000) {
            this.warningMessage = parseApiError(result.errors);
            return;
          }
          this.selectedInfluencer = null;
          this.referredInfluencers.push({
            ...result.profileInfo,
            id: result.profileInfo.influencerId
          });
        }
      } catch (error) {
        this.warningMessage = parseApiError(error);
      } finally {
        this.loading = false;
      }
    },
    copyToClipboard(str) {
      copyToClipboard(str);
    },
    async sendMailForInfluencerTemplatesReview(influencer_templates_id, type, event) {
      event.stopPropagation();
      event.target.classList.add("showSpinner");
      const result = await this.$templatesService.influencerTemplateStatusReviewMail(influencer_templates_id);
      event.target.classList.remove("showSpinner");
      if (result && result.code === 6000) {
        if (type == 1) {
          this.getContractInfluncertemplate();
        }
        if (type == 2) {
          this.getNDAInfluncertemplate();
        }
        if (type == 4) {
          this.getMultipleSignedContractInfluncertemplate();
        }
      }
    },
    async sendTermSheetPdfToInfluencer(influencer_templates_id, type, event) {
      event.stopPropagation();
      event.target.classList.add("showSpinner");
      const result = await this.$templatesService.sendTermSheetPdfToInfluencer(influencer_templates_id);
      event.target.classList.remove("showSpinner");
      if (result && result.code === 6000) {
        if (type == 3) {
          this.getTermSheetInfluncertemplate();
        }
      }
    },
    async sendMailForReferralLinks(event) {
      event.stopPropagation();
      event.target.classList.add("showSpinner");
      try {
        const result = await this.$influencerService.sendReferalLinksMail(this.influencerInfo.influencerId);
        if (result && result.code === 6000) {
          event.target.classList.remove("showSpinner");
          this.getInfluencerInfo();
        }
      } catch (error) {
        this.warningMessage = parseApiError(error);
      }
      this.loading = false;
    },
    async getContractInfluncertemplate() {
      // this.loading = true;
      try {
        const result = await this.$templatesService.influencerstemplateByTypeAndId(1, this.id);
        if (result) {
          this.influencerContractTemplatesInfo = result;
        }
      } catch (error) {
        this.warningMessage = parseApiError(error);
      }
      // this.loading = false;
    },
    async getNDAInfluncertemplate() {
      // this.loading = true;
      try {
        const result = await this.$templatesService.influencerstemplateByTypeAndId(2, this.id);
        if (result) {
          this.influencerNDATemplatesInfo = result;
        }
      } catch (error) {
        this.warningMessage = parseApiError(error);
      }
      // this.loading = false;
    },
    async getTermSheetInfluncertemplate() {
      // this.loading = true;
      try {
        const result = await this.$templatesService.influencerstemplateByTypeAndId(3, this.id);

        if (result) {
          this.influencerTermSheetTemplatesInfo = result;
        }
      } catch (error) {
        this.warningMessage = parseApiError(error);
      }
      // this.loading = false;
    },
    async getMultipleSignedContractInfluncertemplate() {
      // this.loading = true;
      // try {
      //   const result = await this.$templatesService.influencerstemplateByTypeAndId(4, this.id);
      //   if (result) {
      //     this.influencerMultipleSignedContractTemplatesInfo = result.sort((a, b) => b.created_date - a.created_date);
      //   }
      // } catch (error) {
      //   this.warningMessage = parseApiError(error);
      // }
      // this.loading = false;
      // this.$nextTick(() => {
      //   console.log("multipleSignedList", this.$refs.multipleSignedList);
      //   this.$refs.multipleSignedList.getTemplates();
      // });
      if (this.$refs.multipleSignedList) {
        console.log("multipleSignedList", this.$refs.multipleSignedList);
      }
    },
    async deactivateInfluencerTemplate(inftemplateId, template_type) {
      try {
        const result = await this.$templatesService.deactivateInfluencerTemplate(inftemplateId);
        if (result.status) {
          switch (template_type) {
            case 1:
              this.getContractInfluncertemplate();
              break;
            case 2:
              this.getNDAInfluncertemplate();
              break;
            case 3:
              this.getTermSheetInfluncertemplate();
              break;
            case 4:
              this.getMultipleSignedContractInfluncertemplate();
              break;
          }
        }
      } catch (error) {
        console.log(error);
      }
    },
    async deleteContractInfluencerTemplates(inftemplateId) {
      try {
        const result = await this.$templatesService.deleteInfluencerstemplate(inftemplateId);
        if (result) {
          const deletedItemIndex = this.influencerContractTemplatesInfo.findIndex(item => {
            return item.influencer_templates_id === inftemplateId;
          });
          this.influencerContractTemplatesInfo.splice(deletedItemIndex, 1);
        }
      } catch (error) {
        console.log(error);
      }
    },
    async deleteNDAInfluencerTemplates(inftemplateId) {
      try {
        const result = await this.$templatesService.deleteInfluencerstemplate(inftemplateId);
        if (result) {
          const deletedItemIndex = this.influencerNDATemplatesInfo.findIndex(item => {
            return item.influencer_templates_id === inftemplateId;
          });
          this.influencerNDATemplatesInfo.splice(deletedItemIndex, 1);
        }
      } catch (error) {
        console.log(error);
      }
    },
    async deleteTermSheetInfluencerTemplates(inftemplateId) {
      try {
        const result = await this.$templatesService.deleteInfluencerstemplate(inftemplateId);
        if (result) {
          const deletedItemIndex = this.influencerTermSheetTemplatesInfo.findIndex(item => {
            return item.influencer_templates_id === inftemplateId;
          });
          this.influencerTermSheetTemplatesInfo.splice(deletedItemIndex, 1);
        }
      } catch (error) {
        console.log(error);
      }
    },
    async deleteMutlipleSignatureInfluencerTemplates(inftemplateId) {
      try {
        const result = await this.$templatesService.deleteInfluencerstemplate(inftemplateId);
        if (result) {
          const deletedItemIndex = this.influencerMultipleSignedContractTemplatesInfo.findIndex(item => {
            return item.influencer_templates_id === inftemplateId;
          });
          this.influencerMultipleSignedContractTemplatesInfo.splice(deletedItemIndex, 1);
        }
      } catch (error) {
        console.log(error);
      }
    },
    countryName(countryCode) {
      if (countryCode) {
        const index = countries.countriesList.findIndex(x => x.value === countryCode);
        if (index >= 0) {
          return countries.countriesList[index].label;
        }
      }
      return false;
    },
    async createTermSheet() {
      this.loadingTermSheet = true;
      const termSheets = await this.$templatesService.getTemplatesByType(3);
      let templateByType = {};
      if (this.influencerInfo.influencerType == 1) {
        templateByType = termSheets.find(f => f.template_name == "Term Sheet");
      }
      if (this.influencerInfo.influencerType == 2) {
        templateByType = termSheets.find(f => f.template_name == "Agency Term Sheet");
      }
      const template = await this.$templatesService.templatebyid(templateByType.template_id);
      let templateContent = "";
      if (template) {
        templateContent = this.changeEditorContent(template.template_content, {
          influencerName: this.influencerFullName,
          contractValue: this.influencerInfo.contractValue.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
          contractShares: (this.influencerInfo.contractValue / 12.5)
            .toString()
            .replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
          fee: (this.influencerInfo.contractValue / 12.5) * 0.01,
          currentDate: this.$dayjs().format("DD-MM-YYYY")
        });
      }

      const data = {
        influencer_id: this.influencerInfo.influencerId,
        template_id: template.template_id,
        status_flag: 0,
        modified_by: this.$auth.user.id,
        template_type: 3,
        modified_date: new Date(),
        assign_to_influencer: true,
        influencer_template_name: this.influencerFullName,
        influencer_template_content: templateContent,
        is_active: true
      };

      try {
        const result = await this.$templatesService.saveInfluencerTemplate(data);
        if (result) {
          this.getTermSheetInfluncertemplate();
        }
      } catch (error) {
        console.log(error);
      }
      this.loadingTermSheet = false;
    },
    async createNDA() {
      this.loadingNDA = true;
      const ndas = await this.$templatesService.getTemplatesByType(2);
      let templateByType = ndas.find(f => f.template_name == "NDA Contract");
      if (!templateByType) {
        this.loadingNDA = false;
        this.warningMessage = parseApiError("Cannot find a NDA contract!");
        return;
      }
      const template = await this.$templatesService.templatebyid(templateByType.template_id);
      let templateContent = "";
      if (template) {
        templateContent = this.changeEditorContent(template.template_content, {
          influencerName: this.influencerFullName,
          currentDate: this.$dayjs().format("DD-MM-YYYY")
        });
      }

      const data = {
        influencer_id: this.influencerInfo.influencerId,
        template_id: template.template_id,
        status_flag: 0,
        modified_by: this.$auth.user.id,
        template_type: 2,
        modified_date: new Date(),
        assign_to_influencer: true,
        influencer_template_name: this.influencerFullName,
        influencer_template_content: templateContent,
        is_active: true
      };

      try {
        const result = await this.$templatesService.saveInfluencerTemplate(data);
        if (result) {
          this.getNDAInfluncertemplate();
        }
      } catch (error) {
        this.warningMessage = parseApiError(error);
      }
      this.loadingNDA = false;
    },
    changeEditorContent(content, value) {
      return content.replace(/{{\s*([\S]+?)\s*}}/g, (full, property) => {
        return escape(value[property]);
      });

      function escape(str) {
        if (str == null) {
          return "";
        }

        return String(str)
          .replace(/&/g, "&amp;")
          .replace(/>/g, "&gt;")
          .replace(/</g, "&lt;")
          .replace(/"/g, "&#34;")
          .replace(/'/g, "&#39;");
      }
    },
    async deleteInfluencer() {
      const url = `${config.msLandingUrl}/influencer/${this.influencerInfo.influencerId}`;
      await this.$axios.delete(url);
      this.deleteDialog = false;
      this.$nuxt.$router.replace("/influencers");
    },
    async addressLineSubmit() {
      this.loading = true;
      await this.$axios.post(`${config.msLandingUrl}/influencer/edit`, {
        influencerId: this.influencerInfo.influencerId,
        ...this.influencerInfo
      });
      this.loading = false;
    },
    downloadContract(url, filename) {
      this.$axios({
        url,
        method: "GET",
        responseType: "blob"
      }).then(response => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename); //or any other extension
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    },
    showError(err) {
      this.warningMessage = err[0].message;
      goTo(0);
    },
    handleCreateContractSelect(templateId) {
      this.$router.push({
        name: "templates2-templateId-influencerId",
        params: { influencerId: this.id, templateId }
      });
    },
    async loaddAllDocuments() {
      const docs = await this.$templates2Service.listByInfluencer(this.id);
      this.allDocuments = docs.list;
    },
    async handleDocumentSent() {
      await this.loaddAllDocuments();
      this.successMessage = "Document succesffuly have been sent to recipient(s).";
      setTimeout(() => {
        this.successMessage = null;
      }, 5000);
    }
  }
};
</script>

<style>
.tab-item {
  height: 38px;
  min-height: 0;
  min-width: 48px;
  font-size: 12px;
  border-radius: 4px;
}

.text-xs-right {
  text-align: right;
}

.v-application .socials a {
  color: #000 !important;
  text-decoration: none;
  display: block;
}

.socials .fa {
  font-size: 30px;
}

i.socicontiktok img {
  width: 30px;
}

span.no-image {
  background-image: url("/inf-admin/no-image.svg");
  height: 30px;
  background-size: 100% 100%;
  display: inline-block;
  margin-left: auto;
  margin-right: auto;
  margin-top: 4px;
  width: 30px;
}

.spinner {
  display: none;
}

.showSpinner .spinner {
  display: block;
}

.disabled-contract-row {
  color: #6c757d;
  background-color: #eddcd2;
}

.v-main__wrap {
  background: #f5f5f5;
}

.v-text-field__details {
  display: none !important;
}
</style>
