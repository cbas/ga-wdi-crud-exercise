var lock = new window.Auth0Lock(
  'AZX9Hq9UCGNt5g8X347Ttkk5U3ZS7Frd',
  'belgian-chocolates.eu.auth0.com'
)

document.querySelector('#authentication .login')
  .addEventListener('click', () => {
    lock.show({ authParams: { scope: 'openid' } })
  })

document.querySelector('#authentication .logout')
  .addEventListener('click', () => {
    window.localStorage.removeItem('id_token')
  })

const hash = lock.parseHash(window.location.hash)
if (hash && hash.id_token) {
  window.localStorage.setItem('id_token', hash.id_token)
}

const id_token = window.localStorage.getItem('id_token')
if (id_token) {
  lock.getProfile(id_token, function (err, profile) {
    if (err) console.warn('There was an error geting the profile: ' + err.message)
    else document.querySelector('#authentication .name').textContent = profile.name
  })
}

var selectUpdate = document.getElementById('select-player-update')
var selectDelete = document.getElementById('select-player-delete')
var table = document.getElementById('table')
window.fetch('/scores', {
  headers: {
    'Authorization': 'Bearer ' + window.localStorage.getItem('id_token')
  }
})
  .then(res => res.json())
  .then(data => {
    data.forEach(member => {
      // populate select options
      var op1 = document.createElement('option')
      var op2 = document.createElement('option')
      op1.textContent = member.player
      op2.textContent = member.player
      selectUpdate.appendChild(op1)
      // selectDelete.appendChild(op2)

      // populate table rows
      var tr = document.createElement('tr')
      var td1 = document.createElement('td')
      var td2 = document.createElement('td')
      td1.textContent = member.player
      td2.textContent = member.score
      tr.appendChild(td1)
      tr.appendChild(td2)
      table.appendChild(tr)
    })
  }).catch(error => {
    throw new Error(error)
  })
