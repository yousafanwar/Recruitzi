<template>
	<NavBar />
	<SideBar />
	<div class="container">
		<div class="row">
			<div class="col s12">
				<div class="card">
					<nav>
						<div class="nav-wrapper blue lighten-1">
							<div class="col s12">
								<a href="#" class="breadcrumb">Users</a>
							</div>
						</div>
					</nav>

					<div class="row" id="searchInputContainer">
						<div class="input-field col s6">
							<input value="" id="searchInput" type="text" class="validate" v-model="searchIn" />
							<label for="Search">Search</label>
							<a class="waves-effect waves-light btn" style="background-color: deepskyblue" v-on:click="filterQuery()">Search</a>
						</div>
					</div>
					<div class="card-content">
						<span class="card-title">Users</span>
						<table class="striped responsive-table">
							<thead>
								<tr>
									<th>First Name / Last Name</th>
									<th>Email Address</th>
									<th>Role</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="user in userData" :key="user.id">
									<td>
										{{ user.firstname + ' ' + user.lastname }}
									</td>
									<td>
										{{ user.email }}
									</td>
									<td>{{ user.role }}</td>
									<td>
										<RouterLink class="btn-floating grey" :to="`./user/${user.id}`">
											<i class="material-icons modal-trigger"> edit </i>
										</RouterLink>
										<button class="btn-floating red">
											<i class="material-icons modal-trigger" data-target="deleteUserModel" v-on:click="this.userIdToDelete = user.id"> delete </i>
										</button>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="card-action">
						<ul class="pagination">
							<li :class="[listIndex === 1 ? 'disabled' : '']" v-on:click="pageSelector('moveLeft')">
								<a href="#!" class="blue-text">
									<i class="material-icons" v-on:click="pageSelector('left')">chevron_left</i>
								</a>
							</li>

							<li :class="[listIndex === 1 ? 'active blue lighten-1' : 'waves-effect']" v-on:click="pageSelector(1)">
								<a href="#!" :class="[listIndex === 1 ? 'white-text' : 'blue-text']">1</a>
							</li>
							<li :class="[listIndex === 2 ? 'active blue lighten-1' : 'waves-effect']" v-on:click="pageSelector(2)">
								<a href="#!" :class="[listIndex === 2 ? 'white-text' : 'blue-text']">2</a>
							</li>

							<li :class="[listIndex === 3 ? 'active blue lighten-1' : 'waves-effect']" v-on:click="pageSelector(3)">
								<a href="#!" :class="[listIndex === 3 ? 'white-text' : 'blue-text']">3</a>
							</li>
							<li :class="[listIndex === 4 ? 'active blue lighten-1' : 'waves-effect']" v-on:click="pageSelector(4)">
								<a href="#!" :class="[listIndex === 4 ? 'white-text' : 'blue-text']">4</a>
							</li>
							<li :class="[listIndex === 4 ? 'active blue lighten-1' : 'waves-effect']" v-on:click="pageSelector(5)">
								<a href="#!" :class="[listIndex === 5 ? 'white-text' : 'blue-text']">5</a>
							</li>
							<li class="waves-effect" v-on:click="pageSelector('moveRight')">
								<a href="#!" class="blue-text">
									<i class="material-icons">chevron_right</i>
								</a>
							</li>
							<!-- Dropdown Trigger -->
							<li>
								<a class="dropdown-trigger btn" data-target="dropdown1" style="background-color: deepskyblue">{{ pageCount }}</a>
								<span>Items per page</span>

								<!-- Dropdown Structure -->
								<ul id="dropdown1" class="dropdown-content">
									<li class="ppgItem" v-on:click="itemPageCount(10)">10</li>
									<li class="ppgItem" v-on:click="itemPageCount(15)">15</li>
									<li class="ppgItem" v-on:click="itemPageCount(20)">20</li>
									<li class="ppgItem" v-on:click="itemPageCount(25)">25</li>
									<li class="ppgItem" v-on:click="itemPageCount(30)">30</li>
								</ul>
							</li>
							<li class="totalRecords" v-if="pageCount <= totalRecords ? (actualCount = pageCount) : (actualCount = totalRecords)">{{ `${actualCount} of ${totalRecords} results` }}</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div id="deleteUserModel" ref="deleteUserModel" class="modal">
		<div class="modal-content">
			<h4>Delete User?</h4>
			<p>Are you sure you want to delete this user?</p>
		</div>
		<div class="modal-footer">
			<button class="modal-close btn red" v-on:click="deleteUser()">Yes</button>
			<button class="modal-close btn green">No</button>
		</div>
	</div>

	<!-- Fixed Action Button -->
	<div class="fixed-action-btn">
		<RouterLink to="./user/0" class="btn-floating btn-large green">
			<i class="material-icons">add</i>
		</RouterLink>
	</div>
</template>

<script>
	import NavBar from '@/components/NavBar.vue';
	import SideBar from '@/components/SideBar.vue';
	import config from '@/config.js';
	import * as utilities from '../../utilities.js';

	export default {
		data() {
			return {
				userData: [],
				userCount: '',
				token: { Authorization: `Bearer ${utilities.getLoginData().token}` },
				userIdToDelete: null,
				page: 1,
				pageCount: 10,
				orderByCol: 'firstname',
				listIndex: 1,
				searchIn: '',
				totalRecords: ''
			};
		},
		mounted() {
			this.materializeCssFunc();
			this.getAllUsers();
		},
		methods: {
			async getAllUsers() {
				try {
					let result = await (await utilities.apiCall(`${config.host}${config.port}/api/user`, 'GET', null, this.token)).json();
					this.userData = [...result.records];
					this.totalRecords = result.totalRecords;
				} catch (error) {
					console.log('Error in /api/user GET: ', error);
				}
			},
			materializeCssFunc() {
				const elem = this.$refs.deleteUserModel; // need to look into this one
				M.Modal.init(elem);

				const elems = document.querySelectorAll('.dropdown-trigger');
				M.Dropdown.init(elems);
			},

			async deleteUser() {
				if (!this.userIdToDelete) {
					return;
				}
				const uId = this.userIdToDelete;
				let index = this.userData.findIndex(function (u) {
					return u.id === uId;
				});

				try {
					await utilities.apiCall(`${config.host}${config.port}/api/user/${this.userIdToDelete}`, 'DELETE', null, this.token);
				} catch (error) {
					console.log('In utilities.httpReqGET getAllUsers func', error);
				}

				this.userData.splice(index, 1);
			},
			async pageSelector(arg) {
				this.listIndex = arg;
				if (typeof arg === 'number') {
					this.page = arg;
				}
				if (arg === 'moveLeft') {
					this.page -= 1;
					this.listIndex = this.page;
				}
				if (arg === 'moveRight') {
					this.page += 1;
					this.listIndex = this.page;
				}
				try {
					let result = await (await utilities.apiCall(`${config.host}${config.port}/api/user?page=${this.page}&orderByCol=${this.orderByCol}`, 'GET', null, this.token)).json();
					this.userData = [...result.records];
				} catch (error) {
					console.log('Error in /api/user GET: ', error);
				}
			},
			async filterQuery() {
				try {
					let result = await (await utilities.apiCall(`${config.host}${config.port}/api/user?searchText=${this.searchIn}`, 'GET', null, this.token)).json();
					this.userData = [...result.records];
				} catch (error) {
					console.log('Error in /api/user GET: ', error);
				}
			},
			async itemPageCount(arg) {
				this.pageCount = arg;
				try {
					let result = await (await utilities.apiCall(`${config.host}${config.port}/api/user?pageCount=${this.pageCount}`, 'GET', null, this.token)).json();
					this.userData = [...result.records];
				} catch (error) {
					console.log('Error in /api/user GET: ', error);
				}
			}
		},
		components: { NavBar, SideBar }
	};
</script>

<style>
	h3 {
		text-align: center;
	}

	i {
		cursor: pointer;
	}

	i:hover {
		color: gray;
	}
	#searchInputContainer {
		border: 2mm solid deepskyblue;
		border-radius: 2mm;
		max-width: 100%;
		margin: 5mm;
	}
	.ppgItem {
		color: black;
	}
	.totalRecords {
		margin: 2mm;
		padding: -0.2mm;
		font-weight: bold;
		/* border: 1mm solid deepskyblue; */
	}
</style>
