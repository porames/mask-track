import React, { useState, useEffect } from 'react'
import { Formik, Field, Form } from 'formik'
import firebase from '../components/firebase'
import axios from 'axios'

const TextField = (props) => (
    <div>
        <label htmlFor={props.id}>{props.label}</label>
        <Field className='form-control' id={props.id} name={props.id} placeholder={props.label} />
    </div>
)
const RangeInput = (props) => (
    <div className='my-3'>
        <label>คะแนนความร่วมมือของคนในพื้นที่</label>
        <div className='d-flex'>
            <div className="checkboxgroup">
                <label for="score-1">น้อยที่สุด</label>
                <Field type="radio" name="score" id="score-1" value='1' />
            </div>

            <div className="checkboxgroup">
                <label for="score-2">น้อย</label>
                <Field type="radio" name="score" id="score-2" value='2' />
            </div>
            <div className="checkboxgroup">
                <label for="score-3">พอใช้</label>
                <Field type="radio" name="score" id="score-3" value='3' />
            </div>
            <div className="checkboxgroup">
                <label for="score-4">ดี</label>
                <Field type="radio" name="score" id="score-4" value='4' />
            </div>
            <div className="checkboxgroup">
                <label for="score-5">ดีมาก</label>
                <Field type="radio" name="score" id="score-5" value='5' />
            </div>
        </div>
    </div>
)
const MaskForm = (props) => {
    return (
        <Formik
            initialValues={{
                score: '',
                postcode: ''
            }}
            onSubmit={async (values) => {
                try {
                    console.log(values)
                    const geocoding = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${values.postcode}.json?access_token=${process.env.NEXT_PUBLIC_mapboxKey}&country=th&types=postcode`)
                    const latlng = geocoding.data.features[0]['center']
                    if(!latlng) {
                        throw new Error('Postcode invalid')
                    }
                    const db = firebase.firestore()
                    const user = firebase.auth().currentUser
                    db.collection('app').doc('data').collection('survey').add({
                        heat: Number(values.score) / 5,
                        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                        latlng: latlng,
                        uid: user.uid
                    })
                }
                catch (err) {
                    console.log(err)
                }
            }}
        >
            {({
                values,
                errors,
                touched,
                handleChange,
                handleBlur,
                handleSubmit,
                isSubmitting,
            }) => (
                <Form>
                    <TextField id='postcode' label='รหัสไปรษณีย์' />
                    <RangeInput handleChange={handleChange} handleBlur={handleBlur} values={values} />
                    <button className='btn btn-primary' type="submit">Submit</button>
                </Form>
            )}

        </Formik>
    )
}

export default function Response() {
    useEffect(() => {
        firebase.auth().signInAnonymously().then(() => {
            console.log('signed in anonymously')
        }).catch((err) => {
            console.log(err)
        })
    })
    return (
        <div className='container'>
            <h3>แบบสำรวจการใส่หน้ากากอนามัยในพื้นที่</h3>
            <MaskForm />
        </div>
    )
}