import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Select from 'react-select'; 
import './DistributorPage.css';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Mặc định sẵn

function DistributorPage() {
    const [distributors, setDistributors] = useState([]);
    const [newDistributor, setNewDistributor] = useState({
        name: '',
        parentName: '',
    });
    const [parentId, setParentId] = useState(null);

    useEffect(() => {
        axios.get('http://localhost:3012/distributor')
        .then(response => {
            const { distributors } = response.data;
            setDistributors(distributors);
        })
        .catch(error => {
            console.error('Error fetching distributor data:', error);
        });
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewDistributor({
            ...newDistributor,
            [name]: value,
        });
    };

    const handleParentChange = (selectedOption) => {
        setNewDistributor({
            ...newDistributor,
            parentName: selectedOption ? selectedOption.label : '',
        });
        setParentId(selectedOption ? selectedOption.value : null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const distributorData = {
            name: newDistributor.name,
            parentId,
        };
        axios.post('http://localhost:3012/distributor/create', distributorData)
        .then(response => {
            const { message } = response.data;
            toast.success(message);
            axios.get('http://localhost:3012/distributor')
            .then(response => {
                const { distributors } = response.data;
                setDistributors(distributors);
            })
            .catch(error => {
                console.error('Error fetching distributor data:', error);
            });
        })
        .catch(error => {
            const { message } = error.response.data;
            toast.error(message);
            console.error('Error creating distributor:', error);
        });
    };

    const handleDelete = (distributorId) => {
        axios.delete(`http://localhost:3012/distributor/${distributorId}`)
        .then(response => {
            const { message } = response.data;
            toast.success(message);
            axios.get('http://localhost:3012/distributor')
            .then(response => {
                const { distributors } = response.data;
                setDistributors(distributors);
            })
            .catch(error => {
                console.error('Error fetching distributor data:', error);
            });
        })
        .catch(error => {
            const { message } = error.response.data;
            toast.error(message);
            console.error('Error deleting distributor:', error);
        });
    }

    // Trả về danh sách parent gồm [label, value]
    const parentOptions = distributors.map(distributor => ({
        value: distributor._id,
        label: distributor.name,
    }));

    // Lọc ra các parent phù hợp với dữ liệu nhập vào
    const customFilterOption = (option, inputValue) => {
        const lowerCaseInput = inputValue.toLowerCase();
        return option.label.toLowerCase().startsWith(lowerCaseInput);
    };

    return (
        <div className="distributor-container">
            <div className='distributor-form'>
                <form onSubmit={handleSubmit}>
                    <label htmlFor='name'>Nhà phân phối mới</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={newDistributor.name}
                        onChange={handleChange}
                        required
                    />
                    <label htmlFor='parentName'>Nhà phân phối cấp trên (nếu có)</label>
                    <Select
                        id="parentName"
                        name="parentName"
                        options={parentOptions}
                        filterOption={customFilterOption}
                        onChange={handleParentChange}
                        placeholder="Chọn nhà phân phối cấp trên"
                        isClearable
                    />
                    <button className='distributor-btn1'>Tạo nhà phân phối mới</button>
                </form>
            </div>
            <h1>Danh Sách Nhà Phân Phối</h1>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
            <table className="distributor-table">
                <thead>
                    <tr>
                        <th>Nhà phân phối</th>
                        <th>Nhóm</th>
                        <th>Cấp bậc</th>
                        <th>Cấp trên</th>
                        <th>Cấp dưới 1</th>
                        <th>Cấp dưới 2</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {distributors.map(distributor => (
                        <tr key={distributor._id}>
                            <td>{distributor.name}</td>
                            <td>{distributor.groupNo}</td>
                            <td>{distributor.level}</td>
                            <td>{distributor.parentName}</td>
                            <td>
                                {
                                    distributor.children.length > 0 
                                    ? (distributor.children[0].childrenName)
                                    : ''
                                }
                            </td>
                            <td>
                                {
                                    distributor.children.length > 1 
                                    ? (distributor.children[1].childrenName)
                                    : ''
                                }
                            </td>
                            <td> 
                                <button className='delete-distributor-btn' onClick = {() => handleDelete(distributor._id)}>
                                    Xóa
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default DistributorPage;
