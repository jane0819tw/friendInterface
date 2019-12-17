(function () {

  const BASE_URL = 'https://lighthouse-user-api.herokuapp.com/api/v1/'
  const INDEX_URL = BASE_URL + 'users/'

  const modalBody = document.getElementById('modalBody')
  const pagination = document.querySelector('.pagination')
  // 不知道要使用這種很多個東西
  const modalInfo = {
    age: modalBody.querySelector('#ageModal'),
    gender: modalBody.querySelector('#genderModal'),
    birthday: modalBody.querySelector('#birthdayModal'),
    email: modalBody.querySelector('#emailModal'),
    created_at: modalBody.querySelector('#created_atModal'),
    surname: modalBody.querySelector('#surnameModal'),
    avatar: modalBody.querySelector('#avatarModal'),
    region: modalBody.querySelector('#regionModal'),
    flag: modalBody.querySelector('#flagModal'),

  }

  const btnList = document.getElementById('btnList')
  const results = document.getElementById('results')
  const favorite_results = document.getElementById('favorite_results')
  const jumbotron = document.querySelector('.jumbotron')
  const ageSel = document.getElementById('ageSel')
  const regionSel = document.querySelector('#regionSel')
  const citiesList = document.getElementById('citiesList')
  const selectBtn = document.querySelector('#selectBtn')
  const mode = document.getElementById('mode')
  // loading 
  let loading = document.querySelector('.loading')

  const ITEM_PER_PAGE = 18
  const MAX_PAGINATION = 5
  let user_data = []
  let select_user

  let show_data = []
  let regionList = []
  // 為了變更模式新增的變數
  let modeType = 'card-mode'
  let pageNow = 1

  init()
  // 輔助的函式-----------------------------
  function startLoading() {
    loading.classList.add('rotate')
    loading.style.display = 'block'
  }

  function finishLoading() {
    loading.classList.remove('rotate')
    loading.style.display = 'none'
  }

  function getStartIndex() {
    return (pageNow - 1) * ITEM_PER_PAGE
  }
  // ---------------------------------------
  function init() {
    startLoading()
    axios.get(INDEX_URL).then(res => {
      user_data.push(...res.data.results)

      show_data = user_data.slice(getStartIndex(), getStartIndex() + ITEM_PER_PAGE)
      writeResults(modeType, show_data)
      updatePagination(Math.ceil(user_data.length / ITEM_PER_PAGE))

    }).catch(e => console.log(e))
      .then(() => {
        // generate regionList
        user_data.forEach(user => regionList.push(user.region))
        // delete repeat region
        regionList = regionList.filter((region, i, arr) => arr.indexOf(region) === i)
        // 太神啦 加上這行自動依照英文字母開頭排序! 
        // regionList = regionList.sort()
        //console.log(regionList)
        // add option to regionSel
        regionList.forEach(region =>
          regionSel.innerHTML += `<option value="${region}">${region}</option>`
        )
        //finially!! 
        finishLoading()

      })
  }

  function updatePagination(pageLength) {
    pagination.innerHTML = ``
    let page_content = ''
    // 判斷有頁數中間的部分
    if (pageLength > MAX_PAGINATION) {
      // 因為超過需要加上前後頁的部分
      // p目前頁數不是第一頁，加上前一頁
      if (pageNow != 1) {
        page_content +=
          `<li class="page-item"><a data-page=${1} class="page-link" href="#results">第一頁</a></li>
          <li class="page-item"><a data-page=${pageNow - 1} class="page-link" href="#results">前一頁</a></li>`
      }
      // 需要進行縮減 以目前頁數放在中間 這兩行處理 12 或 45這種邊邊的頁數
      let minPage = (pageNow + parseInt(MAX_PAGINATION / 2)) > pageLength ? (pageNow - MAX_PAGINATION + 1) : (pageNow - parseInt(MAX_PAGINATION / 2))
      let maxPage = (pageNow - parseInt(MAX_PAGINATION / 2)) < 1 ? MAX_PAGINATION : (pageNow + parseInt(MAX_PAGINATION / 2))
      for (let i = 1; i <= pageLength; i++) {
        // 可能min或max會超出極值 要過濾掉
        if (i >= minPage && i <= maxPage) {
          page_content += `<li class="page-item ${i === pageNow ? 'active' : ''}"><a data-page=${i} class="page-link" href="#results">${i}</a></li>`
        }
      }
      // 目前頁數不是最後一頁 =>加上 最後一頁和下一頁
      if (pageNow != pageLength) {
        page_content +=
          `<li class="page-item"><a data-page=${pageNow + 1} class="page-link" href="#results">下一頁</a></li>
          <li class="page-item"><a data-page=${pageLength} class="page-link" href="#results">最後一頁</a></li>`
      }
    } else {
      // 正常顯示
      for (let i = 1; i <= pageLength; i++) {
        page_content += `<li class="page-item ${i === pageNow ? 'active' : ''}"><a data-page=${i} class="page-link" href="#results">${i}</a></li>`
      }
    }
    pagination.innerHTML += page_content
  }

  function writeResults(modeType, showData) {
    results.innerHTML = ''
    if (modeType === 'card-mode') {
      showData.forEach(user => {
        let isShow = user.isLike ? 'showLike' : ''
        results.innerHTML += `
        <div class="userBox col-4 col-md-3 col-lg-2 p-2">
          <img src="${user.avatar}" alt="">
          <div class="darken cover" data-id=${user.id}></div>
          <i class="${isShow} like fas fa-heart"></i>
        </div>
      `
      })
    }
    if (modeType === 'list-mode') {
      console.log(showData)
      let html_content = `<ul id="list-mode" class="container-fluid list-group">`

      showData.forEach(user => {
        console.log(user)
        let isShow = user.isLike ? 'showLike' : ''
        html_content += `
        <li class="m-3 list-group-item d-flex align-items-center justify-content-between">
          <div class="userBox col-4 col-md-3 col-lg-2 p-2">
            <img src="${user.avatar}" alt="">
            <div class="darken cover" data-id=${user.id}></div>
            <i class="${isShow} like fas fa-heart"></i>
          </div>
          <div>
            <i class="fas ${user.gender === 'male' ? 'fa-male' : 'fa-female'} mr-3"></i>
            <span class="m-0">${user.name}</span>
          </div>
          <div>
            <i class="text-info mr-3 fas fa-map-marker-alt"></i>
            <span class="text-dark">${user.region}</span>
          </div>
          <div>
            <i class="text-danger mr-3 fas fa-sign-language"></i>
            <span class="text-dark">${getDiffDate(user.created_at)}前加入</span>
          </div>
        </li>
      `
      })
      html_content += `</ul>`
      results.innerHTML += html_content
    }
  }

  function writeFavResults(showFavData) {
    favorite_results.innerHTML = ''
    if (showFavData.length == 0) {
      favorite_results.innerHTML = `<p class="m-5 text-white text-center">目前沒有喜歡的名單喔!</p>`
    }
    showFavData.forEach(user => {
      favorite_results.innerHTML += `
      <div class="userBox col-4 col-md-3 col-lg-2 p-2">
        <img src="${user.avatar}" alt="">
        <div class="cover" data-id=${user.id}" ></div>
        <i class="delete fas fa-minus-circle"></i>
        <i class="showLike like fas fa-heart"></i>
      </div>
    `
    })
  }

  function updateModal(result) {
    result.forEach(([key, value]) => {
      // 另一個寫法
      switch (key) {
        case 'avatar':
          modalInfo[key].src = value
          break
        case 'surname':
        case 'age':
          modalInfo[key].innerText = value
          break
        case 'gender':
          modalInfo[key].classList.remove('fa-male', 'fa-female')
          modalInfo[key].classList.add(value === 'male' ? 'fa-male' : 'fa-female')
          break
        case 'created_at':
          let result = getDiffDate(value) + '前加入'
          modalInfo[key].querySelector('span').innerText = result
          break
        default:
          if (modalInfo[key]) {
            modalInfo[key].querySelector('span').innerText = value
          }
      }
    })
    // 取得國旗
    let region = result.find(([key, value]) => key === 'region')
    axios.get(`https://restcountries.eu/rest/v2/name/${region[1]}?fullText=true`).then(res => {
      let flag = res.data[0].flag
      modalInfo['flag'].src = flag
    }).catch(e => console.log(e))
    // 隨機調色
    document.getElementById('profile').style.backgroundColor =
      `rgb(${255 * Math.random()},${255 * Math.random()},${255 * Math.random()})`
    document.getElementById('bgModal').style.backgroundColor =
      `rgb(${255 * Math.random()},${255 * Math.random()},${255 * Math.random()})`
  }

  function getDiffDate(value) {
    let date = new Date(value)
    let today = new Date()
    let diffY = today.getYear() - date.getYear()
    // 0 表示valsy false
    if (!diffY) {
      // 同年
      let diffM = today.getMonth() - date.getMonth()
      return diffM ? `${diffM}個月` : '這個月'
    } else {
      return `${diffY}年`
    }
  }

  function openModal(id) {
    startLoading()
    axios.get(INDEX_URL + id).then(res => {
      // updata modal ? 
      updateModal(Object.entries(res.data))
      $('#detailModal').modal('show')
    }).catch(e => console.log(e)).then(() => {
      finishLoading()
    })
  }

  function selectUser(gender, age, region) {
    startLoading()
    select_user = [...user_data]
    if (age) {
      select_user = select_user.filter(user => user.age > age)
    }
    if (gender) {
      select_user = select_user.filter(user => user.gender === gender)
    }
    if (region) {
      select_user = select_user.filter(user => user.region === region)
    }

    show_data = select_user.slice(getStartIndex(), getStartIndex() + ITEM_PER_PAGE)
    writeResults(modeType, show_data)
    pageNow = 1
    updatePagination(Math.ceil(select_user.length / ITEM_PER_PAGE))
    // 好像會一直delay?
    setTimeout(finishLoading, 500)

  }

  let count = 0
  // listen to normal results
  results.addEventListener('click', evt => {
    if (evt.target.matches('.darken')) {
      count++
      setTimeout(() => {
        console.log(count)
        if (count === 1) {
          let id = evt.target.dataset.id
          openModal(id)
        } else if (count === 2) {
          // 和click愛心一樣的事情
          evt.target.nextElementSibling.classList.toggle('showLike')
          let id = parseInt(evt.target.dataset.id)
          let selUser = user_data.find(user => user.id === id)
          if (!selUser.isLike) {
            selUser.isLike = true
          } else {
            selUser.isLike = selUser.isLike ? false : true
          }
        }
        count = 0
      }, 300)
    }
  })
  // listen to favorite rsults
  favorite_results.addEventListener('click', evt => {
    console.log(evt.target)
    if (evt.target.matches('.delete')) {
      let id = parseInt(evt.target.previousElementSibling.dataset.id)
      console.log(id)
      let selUser = user_data.find(user => user.id === id)
      selUser.isLike = false
      // remove in the panel 
      evt.target.parentElement.remove()


      // 沒有清單時
      if (!favorite_results.children.length) {
        console.log('update html')
        favorite_results.innerHTML = `<p class="m-5 text-white text-center">目前沒有喜歡的名單喔!</p>`
      }
    }
    // 一般click的時候
    if (evt.target.matches('.cover')) {
      setTimeout(() => {
        let id = evt.target.dataset.id
        openModal(id)
      }, 300)
    }
  })
  // listen to select button
  selectBtn.addEventListener('click', () => {
    let genderSel = document.querySelector('input[type="radio"]:checked')
    selectUser(genderSel.value, ageSel.value, citiesList.value)

  })
  // listen to navbar list
  btnList.addEventListener('click', evt => {

    if (evt.target.matches('#homeBtn')) {
      // update now userData-- 不傳入任何參數
      selectUser()
      // d-flex 設定為 !important 所以用另一個方法
      // results
      results.style.opacity = 1
      results.style.height = 'initial'
      // favorite_results
      favorite_results.style.opacity = 0
      favorite_results.style.height = 0
      jumbotron.style.display = 'flex'
      mode.style.display = 'block'
    }
    if (evt.target.matches('#favoriteBtn')) {
      // update favorite results
      let favorite_user = [...user_data]
      favorite_user = favorite_user.filter(user => user.isLike)

      let showFavData = favorite_user.slice(0, ITEM_PER_PAGE)
      console.log(showFavData)
      writeFavResults(showFavData)
      updatePagination(1, Math.ceil(favorite_user.length / ITEM_PER_PAGE))

      favorite_results.style.opacity = 0
      results.style.height = 0
      favorite_results.style.opacity = 1
      favorite_results.style.height = 'initial'
      // favorite_results.style.minHeight = '100vh'
      jumbotron.style.display = 'none'
      mode.style.display = 'none'
    }
  })

  // listen to pagination
  pagination.addEventListener('click', evt => {
    if (evt.target.tagName === 'A') {
      pageNow = parseInt(evt.target.dataset.page)
      // 是否有選擇過
      let nextData = select_user ? select_user : user_data
      show_data = nextData.slice(getStartIndex(), getStartIndex() + ITEM_PER_PAGE)
      writeResults(modeType, show_data)
      updatePagination(Math.ceil(nextData.length / ITEM_PER_PAGE))
    }
  })

  mode.addEventListener('click', evt => {
    if (evt.target.tagName === 'I') {
      modeType = evt.target.id
      writeResults(modeType, show_data)
    }
  })
})()