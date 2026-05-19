import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useStudentDashboard(userId) {
  const [studentRecord, setStudentRecord] = useState(null)
  const [applications, setApplications] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [courses, setCourses] = useState([])
  const [currentApplication, setCurrentApplication] = useState(null)
  const [applicationProgress, setApplicationProgress] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isStudent, setIsStudent] = useState(false)
  const [error, setError] = useState(null)

  const loadDashboardData = useCallback(async () => {
    if (!userId) {
      console.log('No userId provided to useStudentDashboard')
      setIsLoading(false)
      return
    }
    
    console.log('Loading dashboard data for userId:', userId)
    setIsLoading(true)
    setError(null)
    
    try {
      // Check if user is a student
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('student_id', userId)
        .maybeSingle()
      
      if (studentError) {
        console.error('Error checking student record:', studentError)
      }
      
      if (studentData && !studentError) {
        console.log('Student record found:', studentData)
        setIsStudent(true)
        setStudentRecord(studentData)
        
        // Load enrollments - FIXED: changed classError to enrollmentError
        const { data: enrollmentData, error: enrollmentError } = await supabase
          .from('enrollments')
          .select(`
            *,
            course:course_id (*)
          `)
          .eq('student_id', studentData.id)
        
        if (enrollmentError) {
          console.error('Error loading enrollments:', enrollmentError)
        } else {
          console.log('Enrollments loaded:', enrollmentData?.length || 0)
          setEnrollments(enrollmentData || [])
        }
        
        // Load applications with course info
        const { data: appData, error: appError } = await supabase
          .from('application')
          .select(`
            *,
            course:course_id (*),
            parent_details:application_parent (*)
          `)
          .eq('user_id', studentData.student_id)
          .order('created_at', { ascending: false })
        
        if (appError) {
          console.error('Error loading applications:', appError)
        } else {
          console.log('Applications loaded:', appData?.length || 0)
          setApplications(appData || [])
        }
        
        // Check for in-progress application
        const pendingApp = appData?.find(app => 
          app.status === 'pending' && 
          app.progress !== 'completed' && 
          app.progress !== 'rejected'
        )
        
        if (pendingApp) {
          console.log('Pending application found:', pendingApp)
          setCurrentApplication(pendingApp)
          setApplicationProgress(pendingApp.progress)
        }
      } else {
        console.log('User is not a student, checking for applications')
        setIsStudent(false)
        
        // Load applications with course info
        const { data: appData, error: appError } = await supabase
          .from('application')
          .select(`
            *,
            course:course_id (*),
            parent_details:application_parent (*)
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
        
        if (appError) {
          console.error('Error loading applications for non-student:', appError)
        } else {
          console.log('Applications loaded for non-student:', appData?.length || 0)
          setApplications(appData || [])
        }
        
        const pendingApp = appData?.find(app => 
          app.status === 'pending' && 
          app.progress !== 'completed' && 
          app.progress !== 'rejected'
        )
        
        if (pendingApp) {
          console.log('Pending application found for non-student:', pendingApp)
          setCurrentApplication(pendingApp)
          setApplicationProgress(pendingApp.progress)
        }
      }
      
      // Load available courses
      console.log('Fetching courses from database...')
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .order('course_name', { ascending: true })
      
      if (coursesError) {
        console.error('Error loading courses:', coursesError)
        setError(`Failed to load courses: ${coursesError.message}`)
        setCourses([])
      } else {
        console.log('Courses loaded successfully:', coursesData?.length || 0)
        setCourses(coursesData || [])
      }
      
    } catch (error) {
      console.error('Unexpected error loading dashboard data:', error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }, [userId])
  
  const updateApplicationProgress = useCallback(async (applicationId, progress, additionalData = null) => {
    const updates = { progress }
    
    if (progress === 'payment') {
      updates.status = 'pending_payment'
    } else if (progress === 'completed') {
      updates.status = 'awaiting_approval'
    }
    
    const { error } = await supabase
      .from('application')
      .update(updates)
      .eq('id', applicationId)
    
    if (error) {
      console.error('Error updating application:', error)
      throw error
    }
    
    // Save parent details if provided
    if (additionalData && progress === 'payment') {
      const { error: parentError } = await supabase
        .from('application_parent')
        .upsert({
          application_id: applicationId,
          ...additionalData
        })
      
      if (parentError) {
        console.error('Error saving parent details:', parentError)
        throw parentError
      }
    }
    
    await loadDashboardData()
  }, [loadDashboardData])
  
  const deleteApplication = useCallback(async (applicationId) => {
    console.log('Deleting application:', applicationId)
    const { error } = await supabase
      .from('application')
      .delete()
      .eq('id', applicationId)
    
    if (error) {
      console.error('Error deleting application:', error)
      throw error
    }
    await loadDashboardData()
  }, [loadDashboardData])
  
  const createNewApplication = useCallback(async (courseId, lessonType, paymentPlan) => {
    const { data, error } = await supabase
      .from('application')
      .insert({
        user_id: userId,
        course_id: courseId,
        lesson_type: lessonType,
        payment_plan: paymentPlan,
        progress: 'parent_details',
        status: 'pending'
      })
      .select()
      .maybeSingle()
    
    if (error) {
      console.error('Error creating application:', error)
      throw error
    }
    
    console.log('Application created:', data)
    await loadDashboardData()
    return data
  }, [userId, loadDashboardData])
  
  useEffect(() => {
    loadDashboardData()
  }, [userId, loadDashboardData])
  
  return {
    studentRecord,
    applications,
    enrollments,  // This is correct
    courses,
    currentApplication,
    applicationProgress,
    isLoading,
    isStudent,
    error,
    refreshData: loadDashboardData,
    updateApplicationProgress,
    deleteApplication,
    createNewApplication
  }
}