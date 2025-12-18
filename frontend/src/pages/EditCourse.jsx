import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom';
import axios from 'axios';

const EditCourse = () => {
  const [courseData, setCourseData] = useState(null);

  const {courseId} = useParams();

  async function fetchCourseData() {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/user/getCourse`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('edvance_token')}`
        },
        params: {
          courseId
        }
      });
      console.log(response.data);
      if (response.data.success) {
        setCourseData(response.data.course);
      }
    } catch (error) {
      console.error("Error fetching course data:", error);
    }
  }

  async function editCourseData() {
    try {
      const response = await axios.put(`${import.meta.env.VITE_BASE_URL}/user/editCourse`, courseData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('edvance_token')}`
        }
      });
      console.log(response.data);
      if (response.data.success) {
       toast.success("Course updated successfully");
      }else{
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error editing course data:", error);
    }
  }

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  return (
    <>
    <div>
      <div>
        {courseData ? (
          <div>
            <h1 className="text-3xl font-bold mb-4">Edit Course: {courseData.courseName}</h1>
            <div>
              <label htmlFor="courseName">Course Name:</label>
              <input
                type="text"
                id="courseName"
                value={courseData.courseName}
                onChange={(e) => setCourseData({ ...courseData, courseName: e.target.value })}
              />
            </div>
          </div>
        ) : (
          <p>Loading course data...</p>
        )}
      </div>
    </div>
    </>
  )
}

export default EditCourse