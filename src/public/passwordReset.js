const newPassword = document.getElementById('newPassword')
const newPasswordConfirm = document.getElementById('newPasswordConfirm')
const button = document.querySelector('.btn')

const token = window.location.href.split('/')[5]

button.addEventListener('click', () => {
	if (newPassword.value !== newPasswordConfirm.value) {
		alert('Passwords do not match')
	} else {
		fetch(
			`${process.env.APP_URL}/api/v1/auth/customer/reset-password/${token}`,
			{
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					newPassword: newPassword.value,
					newPasswordConfirm: newPasswordConfirm.value,
				}),
			}
		)
			.then((res) => res.json())
			.then((data) => {
				if (data.status === 'success') {
					alert('Password reset successful')
				} else {
					alert(`${data.message.password}`)
				}
			})
	}
})
